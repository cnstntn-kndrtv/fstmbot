//@ts-check

let debug = require('debug')('nlp');
let Az = require('az');
let translit = require('transliteration');
var langdetect = require('langdetect');

module.exports = class NLP {
    constructor(cb){
        this.isInitialized = false;
        this._langdetect = langdetect;
        this._langdetect.setHandler('detectByABC');
        this.tokenTypes = {
            entity: '^',
            question: '?:',
            root: '_',
        }
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
        if (typeof(str) == 'string') str = str.replace(/[\^~\?:_]*/g, '');
        return str;
    }

    clearPunctuation(str) {
        if (typeof(str) == 'string') {
            str = str.replace(/\!/g, '');
            str = str.replace(/\./g, '');
            str = str.replace(/\,/g, '');
        if (this.getTokenType(str) != 'question-type') str = str.replace(/\?/g, '');
        }
        return (str);
    }

    deleteUnexpected(str) {
        if (typeof(str) == 'string') {
            str = str.replace(/[\<\>]/g, '');
            str = str.replace(/[\{\}]/g, '');
            str = str.replace(/[\[\]]/g, '');
            str = str.replace(/[\(\)]/g, '');
        }
        return (str);
    }

    addSpaceBeforePunctuation(str) {
        if (typeof(str) == 'string') {
            str = str.replace(/\!/g, ' !');
            str = str.replace(/\?/g, ' ?');
            str = str.replace(/\,/g, ' ,');
            str = str.replace(/\./g, ' .');
            str = str.replace(/\(/g, ' (');
            str = str.replace(/\)/g, ' )');
            str = str.replace(/\*/g, ' *');
            str = str.replace(/\:/g, ' :');
            str = str.replace(/\;/g, ' ;');
            str = str.replace(/\-/g, ' -');
        }
        return(str);
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
        let lemma = word;
        if (parse[0]) {
          lemma = parse[0].normalize().toString();
        }
        return lemma;
    }

    hasRoot(word, root) {
        let index = word.indexOf(root);
        if (index == -1) return false;
        else return true;
    }

    tokenize(str) {
        str = str.split(' ');
        return str;
    }

    getTokenType(str) {
        // ^something - entity
        // _some - root
        // ?:something - question-type
        // else word
        let type = undefined;
        if (typeof(str) == 'string') {
            type = 'word'
            if (str[0] == this.tokenTypes.entity) type = 'entity';
            else if (str[0] == this.tokenTypes.root) type = 'root';
            else if (str.substr(0, 2) == this.tokenTypes.question) type = 'question-type';
        }
        else if (typeof(str) == 'number') type = 'number';

        return type;
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

    getQuestionType(str, cb) {
        /* 
        "whatNames": ["ассортимент", "название", "каталог", "меню", "наличие"],
        "whatIngredients": ["состав", "ингридиенты", "каталог", "меню"],
        "whatSizes": ["размер", "диаметр", "объём"],
        "whatPrices": ["цена", "дорого", "дешево"],
         */
        cb('SomeType');
    }
}