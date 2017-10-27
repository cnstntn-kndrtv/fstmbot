let debug = require('debug')('bot');
let Matcher = require('./matcher');
let NLP = require('../nlp/nlp');
let Rule = require('./rule');
let Knowledge = require('../knowledge/knowledge');

module.exports = class Bot {
    constructor() {
        this.memory = {};
        this.memory.lastQuestions = [];
        this.memory.lastQuestionMaxLength = 3;
        this.context = '';
        this.dialogueId = '';
        this.nlp = new NLP();
        this.mainMatcher = new Matcher(this.nlp);
        this.contextMatchers = {};
        this.dialogueMatchers = {};
        this.question = '';
        this.knowledge = new Knowledge(this.nlp);
        this.plugins = {}
    }

    init() {
        return new Promise((resolve, reject) => {
            this.nlp.init()
                .then((msg) => {
                    console.log(msg)
                    return this.knowledge.init();
                })
                .then((msg) => {
                    // default plugins and knowledges
                    this.addPlugins(require('./brain/plugins'), 'default');
                    this.addKnowledges(require('./brain/knowledges.js'));
                    console.log(msg);
                    resolve('bot init, ok');
                })
        });
    }

    _addRule(rule) {
        if (rule.dialogueId) {
            this.dialogueMatchers[rule.dialogueId] = this.dialogueMatchers[rule.dialogueId] || new Matcher(this.nlp);
            debug('dialogue added. id:', rule.dialogueId, 'inputs:', rule.inputs.join());
            this.dialogueMatchers[rule.dialogueId].addInputs(rule.inputs);
            return;
        }
        if (rule.inputs) {
            this.mainMatcher.addInputs(rule.inputs);
            console.log('')
        }
        if (rule.context && rule.cInputs) {
            this.contextMatchers[rule.context] = this.contextMatchers[rule.context] || new Matcher(this.nlp);
            debug("adding context. context:", rule.context, 'cInputs:', rule.cInputs.join());
            this.contextMatchers[rule.context].addInputs(rule.cInputs);
        }
    }

    addRules(rules) {
        rules.forEach((r) => {
            this._addRule(new Rule(r, this));
        })
    }

    addPlugins(plugins, type) {
        if(type && !this.plugins.hasOwnProperty(type)) this.plugins[type] = {};
        for (var p in plugins) {
            if(type) {
                this.plugins[type][p] = plugins[p];
            }
            else this.plugins[p] = plugins[p];
        }
    }

    addKnowledges(something) {
        this.knowledge.load(something);
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
        let foundInput = null;
        if (this.dialogueId != '') {
            if (this.dialogueMatchers[this.dialogueId]) {
                debug('dialogue mode. id:', this.dialogueId);
                foundInput = this.dialogueMatchers[this.dialogueId].findAnswer(this.question);
            }
            this.dialogueId = '';
        }
        if(!foundInput) {
            if(this.context != '') {
                if(this.contextMatchers[this.context]) {
                    debug('context mode. context:', this.context);
                    foundInput = this.contextMatchers[this.context].findAnswer(question);
                }
                this.context = '';
            }
        }
        if (!foundInput) {
            debug('generic mode');
            foundInput = this.mainMatcher.findAnswer(question);
        }
        if(foundInput) {
            debug('execute:', foundInput);
            foundInput.rule.execute();
        }
        this._updateDialogueMemory(foundInput)
        cb(this.response)
    }

    answerCinputs (currentRule, nextContext) {
        debug('answer cInputs:', currentRule, nextContext);
        if (!nextContext) {
            nextContext = currentRule.context;
        }
        // очистка Input Cinputs из строки запроса
        let wordsToDelete = currentRule.inputs.concat(currentRule.cInputs);
        let question = this.question.split(' '); // !!!!!!!!!!!!!!!!!!!
        var clearedQuestion = this.nlp.deleteWords(wordsToDelete, question);
        clearedQuestion = clearedQuestion.join(' ');
        this.context = nextContext;
        if (clearedQuestion != '') {
            this.answer(clearedQuestion);
        }
    }

}