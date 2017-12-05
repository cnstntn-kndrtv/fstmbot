//@ts-check

const N3 = require('n3');

module.exports = class RDFUtils {
    
    /**
     * @param  {} nlp - иннициализированный инстанс класса NLP
     */
    constructor(nlp) {
        this.nlp = nlp;
        this.N3Util = N3.Util;
    }

    getLanguageTag(str) {
        let lang = this.nlp.detectLanguage(str);
        let tag = '';
        switch (lang) {
            case 'russian':
                tag = '@ru';
                break;
            case 'english':
                tag = '@en';
                break;
            default:
                tag = '';
                break;
        }
        return tag;
    }

    getLiteralWithLangTag(str) {
        let langTag = this.getLanguageTag(str);
        return `"${str}"${langTag}`;
    }

    getLiteralValue(str) {
        return this.N3Util.getLiteralValue(str);
    }

    isLiteral(str) {
        return this.N3Util.isLiteral(str);
    }
    
    getLiteralLanguage(str) {
        return this.N3Util.getLiteralLanguage(str);
    }
    
}