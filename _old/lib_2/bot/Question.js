

module.exports = class Question {
    constructor(bot, question) {
        this._nlp = bot.nlp;
        this._knowledge = bot.knowledge;
        this.rawQuestion = question;
        this.entities = this.getEntities(question);
        this.questionType = this._nlp.getQuestionType(this.question);
        this.tokens = this._nlp.tokenize(question);
    }

    getEntities() {
        return [];
    }

}
