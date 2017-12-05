//@ts-check

let NLP = require('../nlp/nlp');
let DB = require('./utils/DB');
let RDFUtils = require('./utils/rdf-utils');
let debug = require('debug')('knowledge');

module.exports = class Knowledge {
    constructor() {
        this._db = new DB();
        this._isInitialized = false;
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

    save(triple, cb) {
        let db = this._db.db;
        if (typeof(triple) == 'object') {
            db.put(triple, (err) => {
                if (err) {
                    debug('save. ERROR! something goes wrong');
                    console.log(err);
                    cb(false);
                }
                else {
                    debug(`save. ok. triple: s: ${triple.subject}, p: ${triple.predicate}, o: ${triple.object}`);
                    cb(true)
                }
                
              });
        }
        else {
            debug('save. ERROR! triple must be object!');
            cb(false);
        }
    }

    get(triple, cb) {
        let db = this._db.db;
        if (typeof(triple) == 'object') {
            db.get(triple, (err, data) => {
                if (err) {
                    debug('get. ERROR! something goes wrong');
                    console.log(err);
                    cb(false);
                }
                else if (data.length == 0) {
                    debug('get. no data!');
                    cb(false);
                }
                else {
                    debug(`get. ok. triple: s: ${triple.subject}, p: ${triple.predicate}. data: ${data[0].object}`);
                    cb(data[0].object);
                }
              });
        }
        else {
            debug('get. triple must be an object')
            cb(false);
        }
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

}
