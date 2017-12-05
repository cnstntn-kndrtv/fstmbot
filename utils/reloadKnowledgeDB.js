//@ts-check

const DB = require('../lib/knowledge/utils/DB');
const cwd = process.cwd();
const fs = require('fs');

let dbName = 'knowledgeDB';
let dbPath = cwd + '/' + dbName;

fs.stat(dbPath, (err, stat) => {
    if (!err) {
        deleteFolderRecursive(dbPath);
        console.log(`Old DB ${dbName} @ "${dbPath}" deleted`);
    }
    load();
})

function load() {
    let db = new DB(dbName);
    Promise.all([
            db.loadFile(cwd + '/lib/bot/collective-mind/knowledges.ttl'),
            db.loadFile(cwd + '/mind/knowledges.ttl'),
        ])
        .then((msg) => console.log(msg))
        .catch((e) => console.log(e));
}


function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach((file, index) => {
      let curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};