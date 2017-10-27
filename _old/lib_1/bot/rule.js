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
        this.inputs = [];
        this.createInput(rule.input, this.inputs);
        this.cInputs = [];
        this.createInput(rule.cInputs, this.inputs);
        this.context = rule.context || null;
        this.response = rule.response || null;
        this.action = rule.action  || null;
        this.dialogueId = rule.dialogueId  || null;
        this.id = rule.id || this.generateId();
    }

    createInput(input, inputObj) {
        if (input != null) {
            if (typeof(input) == 'string') input = input.split(' ');
            input.forEach((i) => {
                if (typeof(i) == 'string') i = i.split(' ');
                i.forEach((word) => {
                    if (word[0] == '~') {
                        this.bot.knowledge.get(word, (entities) => {
                            if (typeof(entities) == 'string') inputObj.push(new Input(entities, this));
                            else {
                                entities.forEach((e) => {
                                    inputObj.push(new Input(e, this));
                                })
                            }
                        })
                    } else inputObj.push(new Input(word, this));
                })
            })
        }
    }

    execute() {
        if (this.context) {
            this.bot.context = this.context;
        }
        if (this.response) {
            let i = Math.floor(Math.random() * this.response.length);
            this.bot.response = this.response[i];
            // bot.previousAnswer // TODO
        }
        if (this.action) {
            this.plugins = this.bot.plugins;
            this.action();
        }
    }

    generateId() {
        let idSigns = 'qwertyuiopasdfghjklzxcvbnm1234567890';
        let l = 7;
        let id = (this.inputs.length) ? this.inputs[0].toString() : '';
        id += '_';
        id += (this.cInputs.length) ? this.cInputs[0].toString() : '';
        while(l) {
            let i = Math.floor(Math.random() * idSigns.length);
            id += idSigns[i];
            l--;
        }
        return id;
    }

}