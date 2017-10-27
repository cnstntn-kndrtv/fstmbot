class Input {
    constructor(text, rule) {
        this.text = text;
        this.rule = rule;
    }

    toString() {
        return this.text;
    }
}

module.exports = class Rule {
    constructor(rule, bot) {
        this.bot = bot;
        this._createInputs(rule.input);
        this.inputContext = rule.inputContext || 'root';
        this.nextContext = rule.nextContext || 'root';
        this.response = rule.response || null;
        this.action = rule.action  || null;
        this.dialogueId = rule.dialogueId  || null; // TODO kill me or use me
        this.id = rule.id || this._generateId();
    }

    _createInputs(input) {
        this.inputs = [];
        if (input != null) {
            if (typeof(input) == 'string') input = input.split(' ');
            input.forEach((i) => {
                let tokens = this.bot.nlp.tokenize(i);
                tokens.forEach((word) => {
                    this.inputs.push(new Input(word, this));
                })
            })
        }
    }

    execute() {
        this.bot.context = this.nextContext;
        if (this.response) {
            // responce is array& Choose random question
            if (Array.isArray(this.response)) {
                let i = Math.floor(Math.random() * this.response.length);
                this.bot.response = this.response[i];
                // bot.previousAnswer // TODO
            }
            // response is a string
            else {
                this.bot.response = this.response;
            }
            
        }
        // execute rule action
        if (this.action) {
            this.actions = this.bot.actions;
            this.action();
        }
    }

    _generateId() {
        let id = (this.inputs.length > 0) ? this.inputs.join(' ') : '';
        id += '_';
        id += this.inputContext + '>' + this.nextContext;
        let i = 0;
        while (this.bot.rulesId.has(id + '_' + i)) {
            i++;
        }
        id = id + '_' + i;
        this.bot.rulesId.add(id);
        return id;
    }

}