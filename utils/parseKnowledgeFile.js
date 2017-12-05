//@ts-check

let Parser = require('../lib/knowledge/utils/Parser');
let program = require('commander');

let parser = new Parser();
const cwd = process.cwd();

program
    .version('0.0.1')
    .option('-i, --input [input]', 'Knowledge filename *.js (default "./mind/knowledges.js")', cwd + '/mind/knowledges.js')
    .option('-p, --preface [preface]', 'ontology preface file *.ttl  (default "./lib/knowledge/utils/preface.ttl")', cwd + '/lib/knowledge/utils/preface.ttl')
    .option('-o, --output [output]', 'output ontology file *.ttl  (default "./mind/knowledge.ttl")', cwd + '/mind/knowledges.ttl')
    .parse(process.argv);

console.log(
`export started 
input file: '${program.input}',
output file: '${program.output}',
turtle preface file: '${program.preface}',
let's go...\n`);

parser.parseAndSave(program.input, program.output, program.preface);
