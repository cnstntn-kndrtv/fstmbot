//@ts-check

let fs = require('fs');
let NLP = require('../../nlp/NLP');
let N3 = require('n3');
let RDFUtils = require('./rdf-utils');

module.exports = class Parser {
    constructor(nlp) {
        this.indent = '    ',
        this.newLineIndent = '\n' + this.indent;
        this.isInitialized = false;
        this.nlp = nlp;
        this.rdfUtils = new RDFUtils(this.nlp);
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
            }).then((msg) => {
                console.log(msg);
                console.log(`done: parse ${filename} and save to ${outputFileName}`);
            }).catch((e) => console.log(e));
    }

    loadPreface(filename) {
        return new Promise ((resolve, reject) => {
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
                if (this.nlp.getTokenType(cls) == 'entity') {
                    if (!addedClasses.includes(cls)) {
                        let {turtle, id} = this.createClassTriple(cls);
                        turtles += turtle;
                        addedClasses.push(cls);
                    }
                    if (Array.isArray(object[cls])) {
                        object[cls].forEach((e) => {
                            let tokenType = this.nlp.getTokenType(e);
                            if(tokenType == 'entity' && !addedClasses.includes(e)) {
                                let {turtle, id} = this.createSubclassTriple(e, cls);
                                turtles += turtle;
                                addedClasses.push(e);
                            } else if (tokenType == 'word') {
                                let {turtle, id} = this.createEntityTriple(e, cls);
                                turtles += turtle;
                            }
                        })
                    }
                    else {
                        let {turtle, id} = this.createEntityTriple(object[cls], cls);
                        turtles += turtle;
                    }
                    
                }
            }
            resolve(turtles);
        });
        
    }

    createClassTriple(cls) {
        // :Entity a bot:Class ;
        //     bot:writtenRep "entity"@en ;
        //     bot:writtenLemma "entity"@en .

        let {name, id} = this.createId(cls);
        let nameLemma = this.nlp.getLemma(name);
        let langTag = this.rdfUtils.getLanguageTag(name);
        
        let comment = `# class ${name}`;
        let content = `:${id} a bot:Class ;`
        content += `${this.newLineIndent}bot:writtenRep "${name}"${langTag} ;`;
        content += `${this.newLineIndent}bot:writtenLemma "${nameLemma}"${langTag} .`;
        let turtle = '\n\n' + comment + '\n' + content;
        
        return {turtle: turtle, id: id};
    }

    createSubclassTriple(subcls, clsId) {
        // :Syr_subClassOf_Ingredienty a bot:Class ;
        //     bot:subClassOf :Ingredient ;
        //     bot:writtenRep 'сыр'@ru ;
        //     bot:writtenLemma 'сыр'@ru .

        let {name, id} = this.createId(subcls);
        let subClsName = name;
        let subClsNameLemma = this.nlp.getLemma(subClsName);
        let langTag = this.rdfUtils.getLanguageTag(subClsName);

        clsId = this.createId(clsId);
        clsId = clsId.id;

        // id = id + '_subClassOf_' + clsId;

        let comment = `# class ${subClsName} subClass of ${clsId}`;
        let content = `:${id} a bot:Class ;`
        content += `${this.newLineIndent}bot:subClassOf :${clsId} ;`;
        content += `${this.newLineIndent}bot:writtenRep "${subClsName}"${langTag} ;`;
        content += `${this.newLineIndent}bot:writtenLemma "${subClsNameLemma}"${langTag} .`;
        let turtle = '\n\n' + comment + '\n' + content;
        return {turtle: turtle, id: id};
    }

    createEntityTriple(entity, clsId) {
        // :bri_instanceOf_Syr a bot:Entity ;
        //     bot:instanceOf :Cheese ;
        //     rdf:writtenRep 'бри'@ru ;
        //     rdf:writtenLemma 'бри'@ru .

        let clean = this.createId(entity);
        let eId = clean.id;
        let eName = clean.name;
        let langTag = this.rdfUtils.getLanguageTag(eName);

        clean = this.createId(clsId);
        clsId = clean.id;

        eId = eId + '_instanceOf_' + clsId;

        let comment = `# ${eName} instance of ${clsId}`;
        let content = `:${eId} a bot:Entity ;`;
        content += `${this.newLineIndent}bot:instanceOf :${clsId} ;`;
        if (typeof(entity) == 'string') {
            let eNameLemma = this.nlp.getLemma(eName);
            content += `${this.newLineIndent}bot:writtenRep "${eName}"${langTag} ;`;
            content += `${this.newLineIndent}bot:writtenLemma "${eNameLemma}"${langTag} .`;
        }
        else if (typeof(entity) == 'number') {
            content += `${this.newLineIndent}bot:writtenRep "${eName}" ;`;
            content += `${this.newLineIndent}bot:value ${eName} .`;
        }
        
        let turtle = '\n\n' + comment + '\n' + content;
        return {turtle: turtle, id: eId};
    }

    createId(str) {
        let tokenType = this.nlp.getTokenType(str);
        let name = this.nlp.deleteSystemSymbols(str);
        name = this.nlp.clearPunctuation(name);
        name = this.nlp.deleteUnexpected(name);
        if (typeof(name) == 'string') name = name.replace(/ /g, '_');
        let id = this.nlp.transliterate(name);
        if (tokenType == 'entity') {
            id = this.nlp.firstToUpperCase(id);
            // id = '^' + id;
        }
        return {name: name, id: id};
    }

    // порверяет, описаны ли в джейсоне все подклассы из текущего массива
    checkSubClasses(object) {
        return new Promise((resolve, reject) => {
            for (let key in object) {
                if (this.nlp.getTokenType(key) == 'entity') {
                    if (Array.isArray(object[key])) {
                        object[key].forEach((e) => {
                            if (this.nlp.getTokenType(e) == 'entity' && !object.hasOwnProperty(e)) {
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

    save(outputFileName, turtles, preface) {
        // console.log(outputFileName);
        // console.log(preface);
        // console.log(turtles);
        let content = preface + '\n' + turtles;
        return new Promise ( (resolve, reject) => {
            fs.stat(outputFileName, (err, stat) => {
                if (!err) {
                    fs.unlinkSync(outputFileName);
                    console.log(`Old otput file "${outputFileName}" deleted`);
                }
                fs.appendFile(outputFileName, content, err => {
                    if (err) reject (err);
                    else resolve ('Create output file. Ok')
                })
            })
        })
    }

    loadData(filename) {
        return new Promise((resolve, reject) => {
            let object = require(filename);
            resolve(object);
        });
    }
}
