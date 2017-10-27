module.exports = {
    myFunction: function(cr, param) {
        console.log(param);
        // cr.bot.response = currentRule.response;
        cr.bot.context = cr.nextContext;
    },

    test: (test, param) => {
        console.log(param + '000000');
    }
}