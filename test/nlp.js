let NLP = require('../lib/nlp/Nlp');

let nlp = new NLP();

nlp.init()
    .then((msg) => {
        console.log(nlp.getLemma('гауда'));
        console.log(nlp.getLemma('гаудой'));
        console.log(nlp.getLemma('ингридиенты'));
        console.log(nlp.getPOS('ингридиенты'));
    });

