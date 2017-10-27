let fs = require('fs');
let NLP = require('../nlp/nlp');

module.exports = class Knowledge {
    constructor(nlp) {
        if (nlp) {
            this._nlp = nlp;
        }
        this._db = {};
    }

    create() {
    
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!this._nlp) {
                this._nlp = new NLP();
                this._nlp.init().then(() => {
                    resolve('knowledge init, ok');
                })
            } else {
                resolve('knowledge init with custom NLP, ok');
            }
        });
    }

    load(knowledge) {
        for (let e in knowledge) {
            let eLemma = this._nlp.getLemma(e);
            let synonyms = knowledge[e];
            if (!this._db.hasOwnProperty(eLemma)) this._db[eLemma] = []
            synonyms.forEach((s) => {
                this._db[eLemma].push(this._nlp.getLemma(s));
            })
        }
    }

    get(entity, cb) {
        let objects = undefined;
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