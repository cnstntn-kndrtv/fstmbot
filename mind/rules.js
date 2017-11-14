module.exports = [
    {
        input: 'default',
        inputContext: null,
        nextContext: null,
        response: 'there must be something...',
        action: null,
    },
    {
        input: 'привет',
        inputContext: null,
        nextContext: 'привет',
        response: ['здарова'],
        action: function(next) {
            this.actions.default.getPreviousQuestions(this, 5);
            next();
        },
    },
    {
        input: ['как дела?'],
        inputContext: 'привет',
        nextContext: null,
        response: ['норм'],
        action: null,
    },
    {   
        input: ['save'],
        inputContext: null,
        nextContext: 'saved',
        response: ['name saved'],
        action: function(next){
            this.actions.default.save(this, 'name', 'Mike', () => next());
        },
    },
    {
        input: 'get',
        inputContext: null,
        nextContext: 'saved',
        response: null,
        action: function(next){
            this.actions.default.get(this, 'name', (value) => {
                this.bot.response = value;
                next();
            })
        },
    },

    {
        input: '^ингридиенты',
        inputContext: null,
        nextContext: 'ingredients',
        response: 'ингридиент найден',
        action: (next) => {console.log('action 2'); next()},
    },
    {
        input: '?:цена ^товары ^ингридиенты',
        inputContext: null,
        nextContext: 'ingredients',
        response: 'ингридиент найден!!!!!!!',
        action: null,
    },
    {
        input: ['hello'],
        inputContext: null,
        nextContext: 'hello',
        response: ['hi'],
        action: function(next) {
            this.actions.myFunction(this, 'some param');
            next();
        },
    },
    {
        input: ['_череп'],
        inputContext: null,
        nextContext: null,
        response: ['root'],
        action: null
    },
    {
        input: ['стол'],
        inputContext: null,
        nextContext: null,
        response: ['lemma'],
        action: null
    },
]