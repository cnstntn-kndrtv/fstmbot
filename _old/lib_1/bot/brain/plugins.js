module.exports = {
    save: function(currentRule, key, value){
        currentRule.bot.knowledge.save(key, value);
    },

    get: function(currentRule, key, cb){
            currentRule.bot.knowledge.get(key, (value) => {
                cb(value);
            });
    },

    getPreviousQuestions: function(currentRule, backIndex) {
        let lastQuestions = [];
        if (!backIndex) lastQuestions.push(currentRule.bot.memory.lastQuestions[0]);
        else {
            if (currentRule.bot.memory.lastQuestions.length < backIndex) backIndex = currentRule.bot.memory.lastQuestions.length;
            for (let i = 0; i < backIndex; i++) {
                lastQuestions.push(currentRule.bot.memory.lastQuestions[i]);
            }
        }
        return lastQuestions;
    },

    findEntities: function(currentRule, entity) {
        
        // если есть сущность - вернуть ее, если нет - все подряд, которые есть в вопросе.
        // что там еще в алисе есть?
    },
}