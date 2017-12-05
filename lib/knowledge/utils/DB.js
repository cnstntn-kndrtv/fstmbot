const levelup = require("level");
const levelgraph = require("levelgraph");

const N3 = require('n3'),
    fs = require('fs'),
    Stream = require('stream');

let Spinner = require('./Spinner');

module.exports = class DB {
    constructor(dbName) {
        this.dbName = dbName || 'knowledgeDB'
        this.db = levelgraph(levelup(this.dbName));
        this.prefixes = {
            bot: 'http://ldf.kloud.one/botKnowledgeTbox#',
        }
    }

    loadFile(fileName) {
        return new Promise((resolve, reject) => {
            let counter = 0;
            // let graph = lg(db.sublevel(fileName));
            let graph = this.db;
            let spinner = new Spinner();

            let streamParser = N3.StreamParser({
                format: 'N3'
            });
    
            let fileStream = fs.createReadStream(fileName);
    
            fileStream.on('allDone', () => {
                resolve('ok');
            });
    
            fileStream.on('error', (e) => {
                reject(e);
            })
    
            fileStream.pipe(streamParser);
            streamParser.pipe(new SlowConsumer());
    
            streamParser.on('error', (e) => {
                reject(e);
            });
    
            function SlowConsumer() {
                let writer = new require('stream').Writable({
                    objectMode: true
                });
                writer._write = function(triple, encoding, done) {
                    graph.put(triple, function(err) {
                        spinner.spin(++counter);
                        done();
                    });
                };
                writer.on('finish', () => {
                    fileStream.emit('allDone');
                });
                return writer;
            }
        });
    }

    // TODO: cant delete!!!
    update(triple) {
        this.db.put(triple, (err) => {
            this.db.del(triple, function(err) {
                db.put(triple, function(err) {

                });
            });
        });
    }

    clean() {

    }

}
