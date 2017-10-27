let NLP = require('../nlp/nlp');
let DB = require('./utils/DB');
let RDFUtils = require('./utils/rdf-utils');


module.exports = class Knowledge {
    constructor() {
        this._db = new DB();
        this._isInitialized = false;
    }

    // TODO kill me or use me
    create() {
    
    }

    /**
     * инициализация. обязатеьная
     * @param {NLP} nlp - инстанс класса NLP, необязательно
     */
    init(nlp) {
        return new Promise((resolve, reject) => {
            if (this._isInitialized) {
                resolve('knowledge was already init, ok');
            } 
            else {
                this._isInitialized = true;
                if (nlp) {
                    this._nlp = nlp;
                    this._rdfUtils = new RDFUtils(this._nlp);
                    resolve('knowledge init with custom NLP, ok');
                }
                else {
                    this._nlp = new NLP();
                    this._nlp.init()
                        .then((msg) => {
                            console.log(msg);
                            this._rdfUtils = new RDFUtils(this._nlp);
                            resolve('knowledge init, ok');
                        })
                }
            }
        });
    }

    // TODO kill me ???
    load(knowledge) {
        for (let e in knowledge) {
            let eLemma = this._nlp.getLemma(e);
            let synonyms = knowledge[e];
            if (!this._db.hasOwnProperty(eLemma)) this._db[eLemma] = []
            if (Array.isArray(synonyms)) {
                synonyms.forEach((s) => {
                    this._db[eLemma].push(this.nlp.getLemma(s));
                })
            }
            else if (typeof(synonyms) == 'string') this._db[eLemma].push(this.nlp.getLemma(synonyms));
            else if (typeof(synonyms) == 'number') this._db[eLemma].push(synonyms);
        }
    }

    get(key, cb) {
        let objects = false;
        if(this._db.hasOwnProperty(key)) {
            objects = this._db[key]
        } 
        cb(objects);
    }

    /**
     * возвращает иерархию классов сущности
     * @param {string} entityWr - строка с сущностью
     * @param {function} cb 
     */
    getClassesOfEntity(entityWr, cb) {
        entityWr = this._nlp.getLemma(entityWr)
        entityWr = this._rdfUtils.getLiteralWithLangTag(entityWr);
        
        // TODO для ускорения перед запросом нужно проверить, есть ли такое слово в словаре
        let db = this._db.db;
        let prefixes = this._db.prefixes;
        let query = [
            {
                subject: db.v('entityId'),
                predicate: `${prefixes.bot}writtenLemma`,
                object: entityWr
            },
            {
                subject: db.v('entityId'),
                predicate: `${prefixes.bot}instanceOf`,
                object: db.v('classId')
            },
            {
                subject: db.v('classId'),
                predicate: `${prefixes.bot}writtenLemma`,
                object: db.v('classWRLemma')
            }
        ]
        
        let result = false;;
        db.search(query, (err, data) => {
            if (err) console.log(err);
            else if (data.length > 0) {
                if (data.length > 0) {
                    let d = data[0];
                    result = [];
                    result.push({
                        classId: d.classId,
                        classWRLemma: this._rdfUtils.getLiteralValue(d.classWRLemma),
                    });
                    this.getClassHierarchy(d.classId, 3, (res) => {
                        res.forEach((r) => {
                            result.push(r);
                        })
                        cb(result);
                    })
                }
            }
            else {
                cb(result);
            }
          });
    }

    /**
     * возвращает иерархию классов по id класса
     * @param {string} subClassId - id класса, которому нужно вернуть иерархию
     * @param {int} levels - сколько уровней иерархии максимум
     * @param {function} cb 
     */
    getClassHierarchy(subClassId, levels, cb) {
        let results = [];
        function next (subClassId, counter, that){
            that.getClassOfSubclass(subClassId, (res) => {
                if (counter && res) {
                    counter--;
                    results.push(res);
                    next(res.classId, counter, that);
                }
                else cb(results)
            })
        }
        let that = this;
        next(subClassId, levels, that);
    }

    /**
     * возвращает родительский класс подкласса
     * @param {string} subClassId - id подкласса, которому нужно вернуть родителя
     * @param {function} cb 
     */
    getClassOfSubclass(subClassId, cb) {
        let db = this._db.db;
        let prefixes = this._db.prefixes;
        let query = [
            {
                subject: subClassId,
                predicate: `${prefixes.bot}subClassOf`,
                object: db.v('classId')
            }, 
            {
                subject: db.v('classId'),
                predicate: `${prefixes.bot}writtenLemma`,
                object: db.v('classWRLemma')
            }
        ]
        let result = false;
        db.search(query, (err, data) => {
            if (err) console.log(err);
            else if (data.length > 0) {
                let d = data[0];
                result = {
                    classId: d.classId,
                    classWRLemma: this._rdfUtils.getLiteralValue(d.classWRLemma),
                }
                cb(result);
            }
            else {
                cb (result);
            }
        })
    }

    // TODO fix me
    save(key, value, cb) {
        this._db[key] = value;
    }

}
