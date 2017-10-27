let NLP = require('../nlp/nlp');

module.exports = class Knowledge {
    constructor() {
        this._db = {};
        this.isInitialized = false;
    }

    create() {
    
    }

    init(nlp) {
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve('knowledge was already init, ok');
            } 
            else {
                this.isInitialized = true;
                if (nlp) {
                    this._nlp = nlp;
                    resolve('knowledge init with custom NLP, ok');
                }
                else {
                    this._nlp = new NLP();
                    this._nlp.init()
                        .then((msg) => {
                            console.log(msg);
                            resolve('knowledge init, ok');
                        })
                }
            }
        });
    }

    load(knowledge) {
        for (let e in knowledge) {
            let eLemma = this._nlp.getLemma(e);
            let synonyms = knowledge[e];
            if (!this._db.hasOwnProperty(eLemma)) this._db[eLemma] = []
            if (Array.isArray(synonyms)) {
                synonyms.forEach((s) => {
                    this._db[eLemma].push(this._nlp.getLemma(s));
                })
            }
            else if (typeof(synonyms) == 'string') this._db[eLemma].push(this._nlp.getLemma(synonyms));
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

    getEntities(entity, cb) {
        // среди всего того, что сущность найти рукурсивно всё то, что литерал(?)

        let objects = false;
        entity = this._nlp.deleteSystemSymbols(entity);
        let lemma = this._nlp.getLemma(entity);
        entity = (lemma) ? lemma : entity;
        if(this._db.hasOwnProperty(entity)) {
            objects = this._db[entity]
        } 
        cb(objects);
    }

    save(key, value, cb) {
        this._db[key] = value;
    }

}
