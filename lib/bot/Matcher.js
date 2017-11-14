let debug = require('debug')('matcher');
// класс Matcher 2 функции:
// создает индексы для поиска правил
// ищет правила, подходящие к вопросу
module.exports = class Matcher {
    /**
     * конструктор класса
     * @param  {NLP} nlp - инициализированный инстанс класса NLP
     */
    constructor(nlp){
        this._nlp = nlp;
        
        /**
         * индексы для быстрого поиска правил.
         * tokenType - тип токена (слово/сущность/типВопроса)
         * token - токена
         * Input - правило. экземпляр класса Input (в файле Rule.js)
         *
         * this.tokens = {
         *     tokenType: {
         *         token: [Input, Input]
         *     } || undefined
         * }
         */
        this.tokens = {};
    }
    /**
     * создает индексы для быстрого поиска правил в this.tokens
     * @param  {Rule.input} ruleInputs - токены из инстанса класса Rule
     */
    addInputs(ruleInputs) {
        /**
         * rule.inputs = {
         *     words: [Input, Input] || undefined
         *     entities: [Input, Input] || undefined
         *     questionType: [Input, Input] || undefined
         * }
        */

        for (let tokenType in ruleInputs) {
            let inputs =  ruleInputs[tokenType];
            if (inputs) {
                this.tokens[tokenType] = this.tokens[tokenType] || {};
                let thisTT = this.tokens[tokenType];
                inputs.forEach((input) => {
                    if (tokenType == 'words' && input.text == 'default') {
                        this.default = input;
                        debug('addInputs. deafault rule added:', JSON.stringify(input.rule.response));
                    } else {
                        thisTT[input.text] = thisTT[input.text] || [];
                        if (thisTT[input.text].indexOf(input) < 0) {
                            thisTT[input.text].push(input);
                            debug('addInputs. token added. Token type:', tokenType, 'token:', input.text);
                        }
                    }
                })
            }
        }
    }
    
    /**
     * ищет правило, подходящее под вопрос
     * @param  {Question} q - инстанс класса Question
     */
    findAnswer(q) {
        /*
            q = Question  = {
                rawQuestion: str
                words: []
                questionType: string
                entities: {
                    'token' [ // classHierarchy 3 levels
                        {
                            classId: str,
                            classWRLemma: str
                        }
                    ]
                }
            }
        */

        /*
            this.tokens = {
                tokenType: {
                    token: [Input, Input]
                } || undefined
            }
        */

        /**
         * веса типов токенов.
         * Например есть 2 правила. В одном слово "сыр" а в другом есть класс "^ингридиенты"
         * если в вопорсе есть слово сыр, то у этих обоих правил будет одинаоквый вес - он нашел и ингридиент и слово сыр
         * но надо отдать приоритет именно слову.
         */
        let tokenTypeWeight = {
            words: 1,
            entities: 0.9,
            root: 1,
            questionType: 1,
        }

        debug('question:', q.rawQuestion);
        let result = null;
        let selectedRules = [];
        
        /**
         * ищем все слова в вопросе и возвращаем подходящие праила из this.tokens.words
         * ищем корни в вопросе и возвращаем правила из this.tokens.root
         * this.tokens = {
         *     words : {
         *          word: [Input, Input]
         *     },
         *     root : {
         *          word: [Input, Input]
         *     }
         */
        let hasRootTokens = this.tokens.hasOwnProperty('root');
        q.words.forEach((w) => {
            // ищем совпадения слов
            // если есть индекс для этого слова
            if (this.tokens.words[w]) weighingRules(this.tokens.words[w], 'words', w);
            // иначе ищем индекс для леммы слова
            else {
                let lemma = this._nlp.getLemma(w);
                debug('lemma');
                if(this.tokens.words[lemma]) weighingRules(this.tokens.words[lemma], 'words', lemma);
            }

            // ищем корни
            if (hasRootTokens) {
                for (let r in this.tokens.root) {
                    if (this._nlp.hasRoot(w, r)) weighingRules(this.tokens.root[r], 'root', r);
                }

            }
        })

        /**
         * взвешивание подходящих правил
         * @param {Array} foundRules - массив правил
         * @param {string} tokenType - тип токена
         * @param {string} token - токен
         */
        function weighingRules(foundRules, tokenType, token) {
            let numOfRules = foundRules.length;
            let tokenWeight = tokenTypeWeight[tokenType] || 1;
            debug('found token:', token, 'tokenType:', tokenType, 'inputs:', foundRules, 'numOfInputs', numOfRules, 'tokenTypeWeight', tokenWeight);
            // взвешиваем все найденные правила
            foundRules.forEach((rule) => {
                rule.score = rule.score || 0;
                rule.score += tokenWeight / numOfRules;
                if ( !selectedRules.includes(rule) ) selectedRules.push(rule);
            })
        }

        /**
         * ищем, какие сущности в вопорсе, есть в this.tokens.entities
         *
         * this.tokens.entities = {
         *     class: [Input, Input]
         * }
         *
         * q.entities: {
         *         'word' [ // classHierarchy 3 levels
         *             {
         *                 classId: str,
         *                 classWRLemma: str
         *             }
         *         ]
         *     }
         */
        
        // шаг, на который будет изменяться вес правила при изменении уровня иерархии классов сущности из вопроса
        // смысл в том, что в вопорсе q.entities лежит вложенность классов. 
        // например на слово гауда найдено - сыр << ингридиент << сущность
        // и у класса Сыр вес больше, чем у Ингридиент
        let downgradeRatio = 0.1;
        for (let word in q.entities) {
            q.entities[word].forEach((cls, level) => {
                let foundRules = this.tokens.entities[cls.classWRLemma];
                if (foundRules) {
                    let numOfInputs = foundRules.length;
                    foundRules.forEach((rule) => {
                        rule.score = rule.score || 0;
                        rule.score += (tokenTypeWeight.entities / numOfInputs) * (1 - downgradeRatio * level);
                        if ( !selectedRules.includes(rule) ) selectedRules.push(rule);
                    })
                }
            })
        }
        

        debug("selected rules:", selectedRules.join());
        // ищем правила с наибольшими весами
        let bestRules = [];
        let highestScore = 0;
        selectedRules.forEach((rule) => {
            if (rule.score > highestScore) {
                highestScore = rule.score;
                bestRules = [];
                bestRules.push(rule);
            }
            if (rule.score == highestScore) bestRules.push(rule);
        })

        // если лучшие правила найдены - выбираем из них случайное
        if(bestRules.length > 0) {
            let n = Math.floor(Math.random() * bestRules.length);
            result = bestRules[n];
        }
        // если правила не найдены - возвращаем деволтный ответ
        else {
            if (this.default) {
                let n = Math.floor(Math.random() * this.default.length);
                result = this.default;
            }
        }

        // очистка весов
        selectedRules.forEach((i) => {
            delete i.score;
        })

        return result;
    }
}