let fs = require('fs');
let NLP = require('../../nlp/Nlp');
let N3 = require('n3');

module.exports = class Parser {
    constructor() {
        this._nlp = new NLP();
        this.indent = '    ',
        this.newLineIndent = '\n' + this.indent;
    }

    parseAndSave(filename, outputFileName, prefaceFileName) {
        this.loadData(filename)
            .then((object) => {
                return this.checkSubClasses(object);
            }).then((object) => {
                return this.parse(object);
            }).then((turtles) => {
                this.turtles = turtles;
                return this.loadPreface(prefaceFileName);
            }).then((preface) => {
                this.preface = preface;
                return this.checkTurtleContent(this.preface + this.turtles);
            }).then((msg) => {
                console.log(msg);
                return this.save(outputFileName, this.turtles, this.preface);
            }).then(() => {
                console.log('done');
            }).catch((e) => console.log(e));

    }

    loadPreface(filename) {
        return new Promise ( (resolve, reject) => {
            fs.readFile(filename, (err, prefaceData) => {
                if(err) reject (err);
                else {
                    resolve(prefaceData.toString());
                }
            })
        })
    }

    parse(object) {
        return new Promise((resolve, reject) => {
            let turtles = ``;
            let addedClasses = [];
            for (let cls in object) {
                let synonyms = object[cls];
                if (this._nlp.getTokenType(cls) == 'entity') {
                    if (!addedClasses.includes(cls)) {
                        turtles += this.createClassTriple(cls);
                        addedClasses.push(cls);
                    }
                    if (Array.isArray(object[cls])) {
                        object[cls].forEach((e) => {
                            let tokenType = this._nlp.getTokenType(e);
                            if(tokenType == 'entity' && !addedClasses.includes(e)) {
                                turtles += this.createSubclassTriple(e, cls);
                                addedClasses.push(e);
                            } else if (tokenType == 'word') {
                                turtles += this.createEntityTriple(e, cls);
                            }
                        })
                    }
                    else {
                        turtles += this.createEntityTriple(object[cls], cls);
                    }
                    
                }
            }
            resolve(turtles);
        });
        
    }

    createClassTriple(cls) {
        // :Sushnost a bot:Class ;
        //      rdf:label 'сущность'@ru .
        let {name, id} = this.createId(cls);
        let comment = `# class ${name}`;
        let content = `:${id} a bot:Class ;`
        content += `${this.newLineIndent}rdf:label "${name}"@ru ;`;
        content += `${this.newLineIndent}rdf:value "${name}"@ru .`;
        let turtle = '\n\n' + comment + '\n' + content;
        return turtle;
    }

    createSubclassTriple(subcls, cls) {
        // :Syr a bot:Class ;
        //     bot:subClassOf :Ingredient ;
        //     rdf:label 'сыр'@ru .
        let {name, id} = this.createId(subcls);
        let subclsName = name;

        let clsId = this.createId(cls);
        clsId = clsId.id;

        let comment = `# class ${subclsName} subClass of ${clsId}`;
        let content = `:${id} a bot:Class ;`
        content += `${this.newLineIndent}bot:subClassOf :${clsId} ;`;
        content += `${this.newLineIndent}rdf:label "${subclsName}"@ru ;`;
        content += `${this.newLineIndent}rdf:value "${subclsName}"@ru .`;
        let turtle = '\n\n' + comment + '\n' + content;
        return turtle;
    }

    createEntityTriple(entity, cls) {
        // :bri a bot:Entity ;
        //     bot:instanceOfClass :Cheese ;
        //     rdf:label 'бри'@ru .
        let clean = this.createId(entity);
        let eId = clean.id;
        let eName = clean.name;

        clean = this.createId(cls);
        let clsId = clean.id;

        let comment = `# ${eName} instance of ${clsId}`;
        let content = `:${eId} a bot:Entity ;`;
        content += `${this.newLineIndent}bot:instanceOfClass :${clsId} ;`;
        if (typeof(entity) == 'string') {
            content += `${this.newLineIndent}rdf:label "${eName}"@ru ;`;
            content += `${this.newLineIndent}rdf:value "${eName}"@ru .`;
        }
        else if (typeof(entity) == 'number') {
            content += `${this.newLineIndent}rdf:label "${eName}" ;`;
            content += `${this.newLineIndent}rdf:value ${eName} .`;
        }
        
        let turtle = '\n\n' + comment + '\n' + content;
        return turtle;
    }

    createId(str) {
        let tokenType = this._nlp.getTokenType(str);
        let name = this._nlp.deleteSystemSymbols(str);
        let id = this._nlp.transliterate(name);
        if (tokenType == 'entity') {
            id = this._nlp.firstToUpperCase(id);
            // id = '~' + id;
        }
        return {name: name, id: id};
    }

    // порверяет, описаны ли в джейсоне все подклассы из текущего массива
    checkSubClasses(object) {
        return new Promise((resolve, reject) => {
            for (let key in object) {
                if (this._nlp.getTokenType(key) == 'entity') {
                    if (Array.isArray(object[key])) {
                        object[key].forEach((e) => {
                            if (this._nlp.getTokenType(e) == 'entity' && !object.hasOwnProperty(e)) {
                                let error = `Подкласс ${e} класса ${key} не описан. В строке объекта ${key}: [${object[key].join(', ')}]`;
                                reject(error);
                            }
                        })
                    }
                }
            }
            resolve(object);
        });
        
    }

    save(outputFileName, turtles, preface) {
        // console.log(outputFileName);
        // console.log(preface);
        // console.log(turtles);
        let content = preface + '\n' + turtles;
        return new Promise ( (resolve, reject) => {
            fs.stat(outputFileName, (err, stat) => {
                if (!err) {
                    fs.unlink(outputFileName);
                    console.log(`Old otput file "${outputFileName}" deleted`);
                }
                fs.appendFile(outputFileName, content, err => {
                    if (err) reject (err);
                    else resolve ('Create output file. Ok')
                })
            })
        })
    }

    checkTurtleFile(filename) {
        return new Promise((resolve, reject) => {
            this.loadFile(filename)
                .then((data) => {
                    return this.checkTurtleContent(data);
                }).then((msg) => {
                    resolve(msg);
                })
        });
        
    }

    checkTurtleContent(triples) {
        return new Promise((resolve, reject) => {
            let parser = N3.Parser();
            parser.parse(triples, ((err, triple, prefixes) => {
                if (err) reject(err);
                else resolve('check turtle content ok');
            }))
        });
    }

    loadFile(fileName) {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            })
        });

    }

    loadData(filename) {
        return new Promise((resolve, reject) => {
            let object = require(filename);
            resolve(object);
        });
    }
}
