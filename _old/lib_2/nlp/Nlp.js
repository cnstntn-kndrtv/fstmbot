let debug = require('debug')('nlp');
let Az = require('az');
let translit = require('transliteration');
var langdetect = require('langdetect');

module.exports = class NLP {
    constructor(cb){
        this.isInitialized = false;
        this._langdetect = langdetect;
        this._langdetect.setHandler('detectByABC');
    }

    init(){
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve('nlp was allready initialized, ok');
            } else {
                Az.Morph.init(() => {
                    this.isInitialized = true;
                    resolve('nlp init, ok');
                });
            }
        });
    }

    deleteSystemSymbols(str) {
        if (typeof(str) == 'string') str = str.replace(/[\^~\?:]*/g, '');
        return str;
    }

    clearPunctuation(str) {
        let s = str.replace(/\!/g, '');
            s = s.replace(/\./g, '');
            s = s.replace(/\,/g, '');
        if (this.getTokenType(s) != 'question-type') s = s.replace(/\?/g, '');
        return (s);
    }

    deleteUnexpected(str) {
        let s = str.replace(/[\<\>]/g, '');
            s = s.replace(/[\{\}]/g, '');
            s = s.replace(/[\[\]]/g, '');
            s = s.replace(/[\(\)]/g, '');
        return (s);
    }

    addSpaceBeforePunctuation(str) {
        let s = str.replace(/\!/g, ' !');
        s = s.replace(/\?/g, ' ?');
        s = s.replace(/\,/g, ' ,');
        s = s.replace(/\./g, ' .');
        s = s.replace(/\(/g, ' (');
        s = s.replace(/\)/g, ' )');
        s = s.replace(/\*/g, ' *');
        s = s.replace(/\:/g, ' :');
        s = s.replace(/\;/g, ' ;');
        s = s.replace(/\-/g, ' -');
        return(s);
    }

    // удаляет слова массива what из массива where
    deleteWords(what, where){ 
        let result = [];
        where.forEach((w) => { result.push(w) });
        where.forEach((w, i) => {
            for (let j = 0; j < what.length; j++) {
                if (what[j] == w) {
                    result.splice(i, 1);
                    break;
                }
            }
        })
        return result;
    }

    getPOS(word) {
        let parse = Az.Morph(word);
        let tag = undefined;
        if (parse[0]) {
              tag = parse[0].tag.POS;
        }
        return tag;
    }

    getLemma(word) {
        let parse = Az.Morph(word);
        let lemma = undefined;
        if (parse[0]) {
          lemma = parse[0].normalize().toString();
        }
        return lemma;
    }

    tokenize(str) {
        str = str.split(' ');
        return str;
    }

    getTokenType(str) {
        // ~something - entity
        // ?:something - question-type
        // else word
        let type = undefined;
        if (typeof(str) == 'string') {
            type = 'word'
            if (str[0] == '~') type = 'entity';
            else if (str.substr(0, 2) == '?:') type = 'question-type';
        }
        else if (typeof(str) == 'number') type = 'number';

        return type;
    }

    getQuestionType(str) {
        /* 
        "whatNames": ["ассортимент", "название", "каталог", "меню", "наличие"],
        "whatIngredients": ["состав", "ингридиенты", "каталог", "меню"],
        "whatSizes": ["размер", "диаметр", "объём"],
        "whatPrices": ["цена", "дорого", "дешево"],
         */
        return ('SomeType');
    }

    firstToUpperCase(str) {
        return str[0].toUpperCase() + str.slice(1);
    }
    
    detectLanguage(str) {
        return this._langdetect.detect(str);
    }

    transliterate(str) {
        return translit(str, 'russian');
    }
}