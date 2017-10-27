let debug = require('debug')('nlp');
let Az = require('az');

module.exports = class NLP {
    constructor(cb){
        // Az.Morph.init(() => {
        //     cb();
        // });
    }

    init(){
        return new Promise((resolve, reject) => {
            Az.Morph.init(() => {
                resolve('nlp init, ok');
            });
        });
    }

    deleteSystemSymbols(str) {
        str = str.replace(/[\^~]*/g, '');
        return str;
    }

    clearPunctuation(str) {
        let s = string.replace(/\!/g, '');
        s = s.replace(/\?/g, '');
        s = s.replace(/\./g, '');
        s = s.replace(/\,/g, '');
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

}