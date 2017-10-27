module.exports = [
    {
        input: 'default',
        inputContext: null,
        nextContext: null,
        response: 'there must be something...',
        action: null,
    },
    {
        input: null,
        inputContext: null,
        nextContext: null,
        response: null,
        action: null,
    },
    {
        input: 'привет',
        inputContext: null,
        nextContext: 'привет',
        response: ['здарова'],
        action: null,
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
        action: function(){
            this.actions.default.save(this, 'name', 'Mike');
        },
    },
    {
        input: 'get',
        inputContext: 'saved',
        nextContext: 'saved',
        response: null,
        action: function(){
            this.actions.default.get(this, 'name', (value) => {
                this.bot.response = value;
            })
            this.actions.default.getPreviousQuestions(this, 5);
        },
    },

    {
        input: '~ингридиенты',
        inputContext: null,
        nextContext: 'ingredients',
        response: 'ингридиент найден',
        action: () => {console.log('action 2')},
    },
    {
        input: '?:цена ~товары ~ингридиенты',
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
        action: function() {
            this.actions.myFunction(this, 'some param');
        },
    },
]