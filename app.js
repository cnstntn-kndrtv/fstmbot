let Bot = require('./lib/bot/Bot');
let NLP = require('./lib/nlp/Nlp');

let nlp = new NLP();
nlp.init()
    .then((msg) => {
        console.log(msg);
        startServer();
    }).catch((e) => console.log(e));


function startServer() {
    let id = 'Marvin';
    startSession(id);
}


function startSession(id) {
    let bot = new Bot({userId: id});
    
    let rules = require('./mind/rules');
    let actions = require('./mind/actions');
    
    bot.init(nlp)
        .then((msg) => {
            console.log(msg);
            bot.addActions(actions);
            bot.addRules(rules);
            startConversation(bot);
        }).catch((e) => console.log(e));
}


function startConversation(bot) {
    console.log('\n---------START CONVERSATION------------\n');
    bot.answer('save', (m) => {
        console.log(bot.question.rawQuestion, '::answer:', m);
    })
    
    bot.answer('get', (m) => {
        console.log(bot.question.rawQuestion, '::answer:', m);
    })
    
    // bot.answer('hello', (m) => {
    //     console.log(bot.question.rawQuestion, '::answer:', m);
    // })

    // bot.answer('сосиски с гаудой', (m) => {
    //     console.log(bot.question.rawQuestion, '::answer:', m);
    // })

    // bot.answer('привет', (m) => {
    //     console.log(bot.question.rawQuestion, '::answer:', m);
    // })

    // bot.answer('как дела?', (m) => {
    //     console.log(bot.question.rawQuestion, '::answer:', m);
    // })

    // bot.answer('чтотонепонятное', (m) => {
    //     console.log(bot.question.rawQuestion, '::answer:', m);
    // })

    // console.log()
}