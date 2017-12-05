//@ts-check

let debug = require('debug')('question');

module.exports = class Question {
    constructor(bot, question, cb) {
        this._nlp = bot._nlp;
        this._knowledge = bot._knowledge;
        this.rawQuestion = question;
        this.words = this._nlp.tokenize(question);
        this._getEntities(this.words)
            .then((entities) => {
                this.entities = entities;
                debug('question:', this.rawQuestion, 'entities:', this.entities);
                return this._getQuestionType(this.rawQuestion);
            }).then((questionType) => {
                this.questionType = questionType;
                debug('question:', this.rawQuestion, 'question type:', this.questionType);
                cb();
            }).catch((e) => {
                cb(e);
            })
        /*
            rawQuestion: str,
            words: [],
            questionType: string,
            entities: {
                'token' [ // *3
                    {
                        classId: str,
                        classWRLemma: str
                    }
                ]
            }
        */

    }

    _getEntities(tokens) {
        return new Promise((resolve, reject) => {
            let results = {};
            let l = tokens.length;
            function next(i, that) {
                if (i < l) {
                    let t = that._nlp.getLemma(tokens[i]);
                    that._knowledge.getClassesOfEntity(t, (res) => {
                        if (res) results[t] = res;
                        i++;
                        next(i, that);
                    })
                }
                else {
                    resolve(results);
                }
            }
            next(0, this);
        });
        
    }

    _getQuestionType(rawQuestion) {
        return new Promise((resolve, reject) => {
            this._nlp.getQuestionType(rawQuestion, (res) => {
                resolve(res);
            })
        });
    }
}
