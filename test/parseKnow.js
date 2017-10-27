let Parser = require('../lib/knowledge/utils/Parser');

let parser = new Parser();
let cwd = process.cwd();
// parser.parseAndSave(cwd + '/mind/knowledges.js', cwd + '/test.ttl', cwd + '/lib/knowledge/utils/preface.ttl');
parser.parseAndSave(cwd + '/lib/bot/collective-mind/knowledges.js', cwd + '/test/test.ttl', cwd + '/lib/knowledge/utils/preface.ttl');
