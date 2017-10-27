let debug = require('debug')('matcher');

module.exports = class Matcher {
    constructor(nlp){
        this.tokens = {};
        this._nlp = nlp;
    }

    addInputs(inputs) {
        if (inputs) {
            inputs.forEach((input) => {
                let inputText = input.text.toLowerCase();
                if (inputText == 'default') {
                    this.default = input;
                } else {
                    inputText = this._nlp.addSpaceBeforePunctuation(inputText);
                    debug('addInputs. words:', inputText);
                    let words = inputText.split(' ');
                    words.forEach((w) => {
                        this.tokens[w] = this.tokens[w] || [];
                        if(this.tokens[w].indexOf(input) < 0) {
                            this.tokens[w].push(input);
                        }
                    })
                }
            })
        }
    }

    findAnswer(q) {
        let words = q.toLowerCase().split(' ');
        let result = null;
        debug('question:', q);
        let selectedInputs = [];
        
        function findInputs(w) {
            let foundInputs = that.tokens[w];
            let numOfInputs = foundInputs.length;
            debug('found token:', w, 'inputs', foundInputs, 'numOfInputs', numOfInputs);
            foundInputs.forEach((i) => {
                i.score = i.score || 0;
                i.score += 1.0 / numOfInputs;
                if (selectedInputs.indexOf(i) < 0) {
                    selectedInputs.push(i);
                }
            })
        }

        let that = this;
        words.forEach((w) => {
            if(that.tokens[w]) findInputs(w);
            else {
                let lemma = this._nlp.getLemma(w);
                if (that.tokens[lemma]) findInputs(lemma);
            }
        })
        debug("selected inputs:", selectedInputs.join());
        let bestInputs = [];
        let highestScore = 0;
        selectedInputs.forEach((i) => {
            if (i.score > highestScore) {
                highestScore = i.score;
                bestInputs = [];
                bestInputs.push(i);
            }
            if (i.score == highestScore) bestInputs.push(i);
        })

        selectedInputs.forEach((i) => {
            delete i.score;
        })
        if(bestInputs.length > 0) {
            let n = Math.floor(Math.random() * bestInputs.length);
            result = bestInputs[n];
        } else {

            if (this.default) {
                let n = Math.floor(Math.random() * this.default.length);
                result = this.default;
            }
        }

        return result;
    }
}