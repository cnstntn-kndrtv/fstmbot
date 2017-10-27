let debug = require('debug')('bot');
let Matcher = require('./Matcher');
let Rule = require('./Rule');
let Question = require('./Question');
let Knowledge = require('../knowledge/Knowledge');
let NLP = require('../nlp/Nlp');

module.exports = class Bot {
    constructor(params) {
        params = params || {};
        this.userId = params.userId || 'some user';
        this.memory = {};
        this.memory.lastQuestions = [];
        this.memory.lastQuestionMaxLength = 3;
        this.matchers = {};
        this.rulesId = new Set();
        this.rules = [];
        this.question = '';
        this.context = 'root';
        this.actions = {};
        this.isInitialized = false;
    }

    init(nlp) {
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve('bot was allready initialized, ok');
            }
            else {
                this.isInitialized = true;
                if (nlp) {
                    this.nlp = nlp;
                }
                else {
                    this.nlp = new NLP();
                }
                this.knowledge = new Knowledge();
                this.nlp.init()
                    .then((msg) => {
                        console.log(msg)
                        return this.knowledge.init(this.nlp);
                    })
                    .then((msg) => {
                        console.log(msg);
                        console.log('add collective mind');
                        // default actions and knowledges
                        this.addActions(require('./collective-mind/actions'), 'default');
                        this.addKnowledges(require('./collective-mind/knowledges.js'));
                        this.addRules(require('./collective-mind/rules'));
                        resolve('bot init, ok');
                    })
            }
            
        })
    }

    // для очистки от ошибок при описании правил
    _addRule(rule) {
        this.rules.push(rule);
        if ( !this.matchers.hasOwnProperty(rule.inputContext)) this.matchers[rule.inputContext] = new Matcher(this.nlp);
        debug("rule added. in context:", rule.inputContext, ', inputs:', rule.inputs.join(', '));
        this.matchers[rule.inputContext].addInputs(rule.inputs);
    }

    addRules(rules) {
        rules.forEach((r) => {
            this._addRule(new Rule(r, this));
        })
        console.log('rules added');
    }

    addActions(actions, type) {
        if(type && !this.actions.hasOwnProperty(type)) this.actions[type] = {};
        for (var p in actions) {
            if(type) {
                this.actions[type][p] = actions[p];
            }
            else this.actions[p] = actions[p];
        }
        console.log('actions added, type:', type);
    }

    addKnowledges(something) {
        this.knowledge.load(something);
        console.log('knowledges added');
    }

    _updateDialogueMemory(foundInput) {
        if (this.memory.lastQuestions.length >= this.memory.lastQuestionMaxLength) this.memory.lastQuestions.pop();
        let conversation = {
            question: this.question,
            rule: foundInput,
        }
        this.memory.lastQuestions.unshift(conversation);
    }

    answer(question, cb) {
        debug('get answer', question);
        this.question = question;
        let q = new Question(this, question);
        let foundInput = null;
        if (this.matchers[this.context]) {
            debug('context:', this.context);
            foundInput = this.matchers[this.context].findAnswer(question);
        }
        if (!foundInput) {
            foundInput = this.matchers['root'].findAnswer(question);
        }
        if(foundInput) {
            debug(`execute Rule. Input: ${foundInput.rule.inputs}, inputContext: ${foundInput.rule.inputContext}, nextContext: ${foundInput.rule.nextContext}, response: ${foundInput.rule.response}, action: ${foundInput.rule.action}`);
            foundInput.rule.execute();
        }
        this._updateDialogueMemory(foundInput)
        cb(this.response)
    }
}