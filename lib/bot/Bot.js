//@ts-check

let debug = require('debug')('bot');
let Matcher = require('./Matcher');
let Rule = require('./Rule');
let Question = require('./Question');
let Knowledge = require('../knowledge/Knowledge');
let NLP = require('../nlp/NLP');

module.exports = class Bot {
    constructor(params) {
        params = params || {};
        this.userId = params.userId || 'some user';
        this.memory = {};
        this.memory.previousQuestions = [];
        this._previousQuestionMaxLength = 3;
        this.matchers = {};
        this._rules = [];
        this._rulesId = new Set();
        this.question = ''; // TODO ???
        this.context = 'root';
        this.actions = {};
        this.isInitialized = false;
    }

    /**
     * инициализация. обязательная
     * @param {NLP} nlp - инстанс класса NLP необязательный
     */
    init(nlp) {
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve('bot was allready initialized, ok');
            }
            else {
                this.isInitialized = true;
                if (nlp) {
                    this._nlp = nlp;
                }
                else {
                    this._nlp = new NLP();
                }
                this._knowledge = new Knowledge();
                this._nlp.init()
                    .then((msg) => {
                        console.log(msg)
                        return this._knowledge.init(this._nlp);
                    })
                    .then((msg) => {
                        console.log(msg);
                        console.log('add collective mind');
                        // default actions and rules
                        this.addActions(require('./collective-mind/actions'), 'default');
                        this.addRules(require('./collective-mind/rules'));
                        resolve('bot init, ok');
                    }).catch((e) => reject(e));
            }
            
        })
    }

    /**
     * добавляет правило
     * @param {Rule} rule 
     */
    _addRule(rule) {
        /*
            this.matchers = {
                'inputContext': Matcher
            }
        */
        this._rules.push(rule);
        this.matchers[rule.inputContext] = this.matchers[rule.inputContext] || new Matcher(this._nlp);
        this.matchers[rule.inputContext].addInputs(rule.inputs);
        debug("rule added. in context:", rule.inputContext, ', inputs:', JSON.stringify(rule.rawInput));
    }

    /**
     * добавляет правила из массива (файлы правил)
     * @param {Array of rules} rules - массив из файла с правилами
     */
    addRules(rules) {
        rules.forEach((r) => {
            this._addRule(new Rule(r, this));
        })
        console.log('rules added');
    }

    /**
     * добавляет действия бота
     * @param {Array} actions - массив из файла с действиями
     * @param {string} type - строка. по умолчанию - app. если default - то действия по дефолту
     */
    addActions(actions, type) {
        if(type && !this.actions.hasOwnProperty(type)) this.actions[type] = {};
        for (var p in actions) {
            if(type) {
                this.actions[type][p] = actions[p];
            }
            else this.actions[p] = actions[p];
        }
        console.log('actions added, type:', (type) ? type : 'app');
    }

    /**
     * обновление истории диалогов с пользователем
     * @param {Input} foundInput - правило
     */
    _updateDialogueMemory(foundInput) {
        if (this.memory.previousQuestions.length >= this._previousQuestionMaxLength) this.memory.previousQuestions.pop();
        let conversation = {
            question: this.question,
            rule: foundInput,
        }
        this.memory.previousQuestions.unshift(conversation);
    }

    /**
     * 
     * @param {string} question - вопрос пользователя
     * @param {*} cb 
     */
    answer(question, cb) {
        debug('get answer', question);
        let q = new Question(this, question, (error) => {
            this.question = q;
            // если ошибка - бот дает дефолтный ответ
            if (error) {
                console.log('!Error!!', error);
                let foundInput = this.matchers.root.default;
                foundInput.rule.execute(() => {
                    cb(this.response);
                });
            }
            else {
                let foundInput = null;
                // если есть matchers для текущего контекста бота - ищем подходящее правилов контексте
                if (this.matchers[this.context]) {
                    debug('context:', this.context);
                    foundInput = this.matchers[this.context].findAnswer(q);
                }
                // если нет - ищем в root контексте
                if (!foundInput) {
                    debug('context: root');
                    foundInput = this.matchers['root'].findAnswer(q);
                }
                // если тоже не найдено - дефолтное правило
                if (!foundInput) {
                    debug('default rule');
                    foundInput = this.matchers.root.default;
                }
                // и выполняем правило
                if(foundInput) {
                    debug(`execute Rule. Input: ${foundInput.rule.inputs}, inputContext: ${foundInput.rule.inputContext}, nextContext: ${foundInput.rule.nextContext}, response: ${foundInput.rule.response}, action: ${foundInput.rule.action}`);
                    foundInput.rule.execute(() => {
                        this._updateDialogueMemory(foundInput)
                        cb(this.response);
                    });
                }
                // такого по идее не должно быть - если правило всё-таки не найдено - отвечаем, что сломались
                else {
                    cb('Oh, no! ERROR 404');
                }
                
            }
        })
    }
}