let Knowledge = require('../lib/knowledge/Knowledge');

let knowledge = new Knowledge();

knowledge.init()
    .then((msg) => {
        console.log(msg);
        knowledge.getClassesOfEntity('гауда', (res) => {
            console.log('res:', res);
        });

        knowledge.getClassesOfEntity('boobies', (res) => {
            console.log('res:', res);
        });

        // knowledge.getClassHierarchy('http://ldf.kloud.one/botKnowledge#Sir', 1, (res) => {
        //     console.log('--', res);
        // })

        // knowledge.getClassOfSubclass('http://ldf.kloud.one/botKnowledge#Sir', (res) => {
        //     console.log('--', res);
        // })
        
        

    }).catch((e) => {console.log(e)});