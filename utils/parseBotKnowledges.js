let Parser = require('../lib/knowledge/utils/Parser');
let cwd = process.cwd();
let NLP = require('../lib/nlp/NLP');
let nlp = new NLP()

nlp.init().then((msg) => {
    let prefaceFilename = cwd + '/lib/knowledge/utils/preface.ttl';
    let collectiveMindPath = cwd + '/lib/bot/collective-mind/';
    console.log('parse collective mind');
    let collectiveParser = new Parser(nlp);
    collectiveParser.parseAndSave(collectiveMindPath + 'knowledges.js', collectiveMindPath + 'knowledges.ttl', prefaceFilename);
    
    let mindPath = cwd + '/mind/'
    console.log('parse current bot mind');
    let individualParser = new Parser(nlp);
    individualParser.parseAndSave(mindPath + 'knowledges.js', mindPath + 'knowledges.ttl', prefaceFilename);
}).catch((e) => console.log(e));

