//@ts-check

class Input {
    constructor(text, rule) {
        this.text = text;
        this.rule = rule;
    }

    toString() {
        return this.text;
    }
}

/**
 * класс, описывающий правила
 */
module.exports = class Rule {
    /**
     * @param {object} rule - правило 
     * rule = {
     *   input: null, 
     *   inputContext: null,
     *   nextContext: null,
     *   response: 'there must be something...',
     *   action: null,
     * }
     * @param {Bot} bot - инстанс класса Bot
     */
    constructor(rule, bot) {
        this.bot = bot;
        this.rawInput = rule.input;
        this._createInputs(rule.input);
        this.inputContext = rule.inputContext || 'root';
        this.nextContext = rule.nextContext || 'root';
        this.response = rule.response || null;
        this.action = rule.action  || null;
        this.id = rule.id || this._generateId();
    }

    /**
     * создает this.inputs
     * @param {*} input 
     */
    _createInputs(input) {
        this.inputs = {
            words: undefined,
            entities: undefined,
            questionType: undefined,
        };
        if (input != null) {
            if (typeof(input) == 'string') input = input.split(' ');
            input.forEach((i) => {
                let tokens = this.bot._nlp.tokenize(i);
                tokens.forEach((t) => {
                    t = t.toLowerCase();
                    let tokenType = this.bot._nlp.getTokenType(t);
                    // ^something - entity
                    // _some - root
                    // ?:something - question-type
                    // else word
                    switch (tokenType) {
                        case 'entity':
                            this._createInput('entities', this.bot._nlp.getLemma(t));
                            break;
                        case 'question-type':
                            this._createInput('questionType', t);
                            break;
                        case 'word':
                            this._createInput('words', this.bot._nlp.getLemma(t));
                            break;
                        case 'root':
                            this._createInput('root', t);
                            break;
                        default:
                            this._createInput('words', this.bot._nlp.getLemma(t));
                            break;
                    }
                })
            })
        }
    }

    /**
     * создает this.inputs[type][Input, Input...]
     * @param {string} type - тип токена 
     * @param {string} token - токен из правила
     */
    _createInput(type, token) {
        token = this.bot._nlp.deleteSystemSymbols(token);
        token = this.bot._nlp.clearPunctuation(token);
        token = this.bot._nlp.deleteUnexpected(token);
        // TODO question type ?????
        this.inputs[type] = this.inputs[type] || [];
        this.inputs[type].push(new Input(token, this));
    }

    /**
     * исполняет это правило - вызываетяс, когда это правило совпало с вопросом пользователя
     */
    execute(cb) {
        // устанавливается контекст бота
        this.bot.context = this.nextContext;
        // исполняет функцию в поле action
        if (this.action) {
            this.actions = this.bot.actions;
            this.action(() => {
                cb();
            });
        }
        if (this.response) {
            // если ответ - массив, то выбирается случайный ответ
            if (Array.isArray(this.response)) {
                let i = Math.floor(Math.random() * this.response.length);
                this.bot.response = this.response[i];
                // bot.previousAnswer // TODO - не повторять подряд одни и те же ответы
            }
            // если ответ - строка
            else {
                this.bot.response = this.response;
            }
            cb();
        }
    }

    /**
     * создает id правила типа input_inputContext>nextContext_число
     * использует this.bot._rulesId для того, чтобы не сделать одинаковый id
     */
    _generateId() {
        let id = (this.rawInput) ? JSON.stringify(this.rawInput) : '';
        id += '_';
        id += this.inputContext + '>' + this.nextContext;
        let i = 0;
        while (this.bot._rulesId.has(id + '_' + i)) {
            i++;
        }
        id = id + '_' + i;
        this.bot._rulesId.add(id);
        return id;
    }

}