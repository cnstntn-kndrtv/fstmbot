//@ts-check

let fs = require('fs');
let Rule = require('../lib/bot/Rule');
let Bot = require('../lib/bot/Bot');

let bot = new Bot();

let rules = require('../mind/rules');
let actions = require('../mind/actions');

bot.init().then((msg) => {
    console.log(msg);
    bot.addActions(actions);
    bot.addRules(rules);
    start();
}).catch((e) => {console.log(e)})

let triples = [];
function start() {
    // TODO rules - Object
    bot._rules.forEach((r) => {
        let inputTriple = {subject: r.id, predicate: 'input', object: r.rawInput, visible: false}
        let inputContextTriple = {subject: r.id, predicate: 'inputContext', object: r.inputContext, visible: false}
        let nextContextTriple = {subject: r.id, predicate: 'nextContext', object: r.nextContext, visible: false}
        
        let response = '';
        if (r.response && Array.isArray(r.response)) response = r.response.join(', ');
        else if(r.response) response = r.response;
        let responseTriple = {subject: r.id, predicate: 'response', object: response, visible: false}
        
        let actionTriple = {subject: r.id, predicate: 'action', object: 'killAllHumans()', visible: false}
        
        triples.push(inputTriple, inputContextTriple, nextContextTriple, responseTriple, actionTriple);

        bot._rules.forEach((cr) => {
            if (cr.inputContext == r.nextContext) {
                triples.push({subject: r.id, predicate: 'nextRules', object: cr.id, visible: true});
            };
        })
    })
    save();

}

let fileName = './view/triples.js'
function save() {
    fs.exists(fileName, (exist) => {
        if (exist) {
            fs.unlinkSync(fileName);
        }
        let content = 'var fromDB = ' + JSON.stringify(triples);
        fs.appendFile(fileName, content, (error) => {
            if(error) console.log(error);
            else console.log('done');
        });
    });
}