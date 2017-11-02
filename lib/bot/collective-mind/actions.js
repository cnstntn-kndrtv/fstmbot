module.exports = {
    save: function(cr, key, value){
        let triple = {
            subject: cr.bot.userId,
            predicate: key,
            object: value
        }
        cr.bot._knowledge.save(triple, () => {});
    },

    get: function(cr, key, cb){
        let triple = {
            subject: cr.bot.userId,
            predicate: key,
        }
        cr.bot._knowledge.get(triple, (value) => {
            cb(value);
        });
    },

    getPreviousQuestions: function(cr, backIndex) {
        let lastQuestions = [];
        if (!backIndex) lastQuestions.push(cr.bot.memory.lastQuestions[0]);
        else {
            if (cr.bot.memory.lastQuestions.length < backIndex) backIndex = cr.bot.memory.lastQuestions.length;
            for (let i = 0; i < backIndex; i++) {
                lastQuestions.push(cr.bot.memory.lastQuestions[i]);
            }
        }
        return lastQuestions;
    },

    findEntities: function(cr, entity) {
        
        // если есть сущность - вернуть ее, если нет - все подряд, которые есть в вопросе.
        // что там еще в алисе есть?
    },
}