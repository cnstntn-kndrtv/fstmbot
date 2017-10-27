function Input(text, rule) {
    this.text = text;
    this.rule = rule;
}
Input.prototype = {
    toString : function() {
        return this.text;
    }
}

function Rule(inputs, cinputs, context, responses, action, dialogueId) {
    this.inputs = [];
    for (var i = 0, x = inputs.length; i < x; i++) {
        this.inputs.push(new Input(inputs[i], this));
    }
    this.cinputs = [];
    if (cinputs != null) {
        for (var j = 0, y = cinputs.length; j < y; j++) {
            this.cinputs.push(new Input(cinputs[j], this));
        }
    }
    this.context = context;
    this.responses = responses;
    this.action = action;
    this.dialogueId = dialogueId;
}

Rule.prototype = {
    execute : function() {
        if (typeof this.context != "undefined" && this.context != null) {
            chatbot.context = this.context;
        }
        if (typeof this.responses != "undefined" && this.responses != null) {
            var i = Math.floor(Math.random() * this.responses.length);
            chatbot.response = this.responses[i];
        }
        if (typeof this.action != "undefined" && this.action != null) {
            this.action();
        }
    }
}

function Matcher() {

}

Matcher.prototype = {
    addInputs2 : function(inputs) {
        console.log(inputs)
        debugger
        if (typeof(inputs) != "undefined"){
            var input = ''
            for(i = 0, k = 0; i < inputs.length; i++){
                if(typeof(inputs[i]) == "object"){
                    for(j = 0; j < inputs[i].length; j++){
                        input = inputs[i][text][j].toLowerCase()
                    }
                }
                else{
                    input = inputs[i].text.toLowerCase()
                }
                input = input.replace(/\!/g, ' !');
                input = input.replace(/\?/g, ' ?');
                input = input.replace(/\,/g, ' ,');
                input = input.replace(/\./g, ' .');
                input = input.replace(/\(/g, ' (');
                input = input.replace(/\)/g, ' )');
                input = input.replace(/\*/g, ' *');
                input = input.replace(/\:/g, ' :');
                input = input.replace(/\;/g, ' ;');
                input = input.replace(/\-/g, ' -');
                var words = input.split(" ");
                console.log("adding words: " + words.join());
                for (var j = 0, y = words.length; j < y; j++) {
                    var token = words[j];
                    this[token] = this[token] || [];
                    if (this[token].indexOf(inputs[i]) < 0) {
                        this[token].push(inputs[i]);
                    }
                }
            }
        }
    },
    
    addInputs : function(inputs) {
        if (typeof inputs != "undefined") {
            for (var i = 0, x = inputs.length; i < x; i++) {
                var input = inputs[i].text.toLowerCase();
                input = input.replace(/\!/g, ' !');
                input = input.replace(/\?/g, ' ?');
                input = input.replace(/\,/g, ' ,');
                input = input.replace(/\./g, ' .');
                input = input.replace(/\(/g, ' (');
                input = input.replace(/\)/g, ' )');
                input = input.replace(/\*/g, ' *');
                input = input.replace(/\:/g, ' :');
                input = input.replace(/\;/g, ' ;');
                input = input.replace(/\-/g, ' -');
                var words = input.split(" ");
                // console.log("adding words: " + words.join());
                for (var j = 0, y = words.length; j < y; j++) {
                    var token = words[j];
                    this[token] = this[token] || [];
                    if (this[token].indexOf(inputs[i]) < 0) {
                        this[token].push(inputs[i]);
                    }
                }
            }
        }
    },
    
    findAnswer : function(question) {
        var q = question;
        var words = q.toLowerCase().split(" ");
        console.log("+ tokens: " + words.join())
        var selectedInputs = [];
        for (var i = 0, x = words.length; i < x; i++) {
            if (typeof(this[words[i]]) != "undefined") {
                console.log("found token: " + words[i])
                var foundInputs = this[words[i]];
                for (var j = 0, y = foundInputs.length; j < y; j++) {
                    foundInputs[j].score = foundInputs[j].score || 0;
                    foundInputs[j].score += 1.0 / y;
                    if (selectedInputs.indexOf(foundInputs[j]) < 0) {
                        selectedInputs.push(foundInputs[j]);
                    }
                }
            }
        }
        console.log("selected inputs: " + selectedInputs.join());
        var bestInput = [];
        var highestScore = 0;
        for (var k = 0, z = selectedInputs.length; k < z; k++) {
            console.log(selectedInputs[k], selectedInputs[k].score);
            if (selectedInputs[k].score > highestScore) {
                highestScore = selectedInputs[k].score;
                bestInput = [];
                bestInput.push(selectedInputs[k]);
            }
            if (selectedInputs[k].score == highestScore) {
                bestInput.push(selectedInputs[k]);
            }
        }
        for (var k = 0, z = selectedInputs.length; k < z; k++) {
            delete selectedInputs[k].score;
        }
        if (bestInput.length > 0) {
            var n = Math.floor(Math.random() * bestInput.length);
            return bestInput[n];
        }
        // проверка на дефолтный ответ
        if (typeof this["default"] != "undefined" && this["default"] != null) {
            var n = Math.floor(Math.random() * this["default"].length);
            return this["default"][n];
        }
        return null;
    }
}

function Chatbot() {
    this.memory = new Object();
    this.memory.filteredGoods = []
    this.context = "";
    this.dialogueId = "";
    this.mainMatcher = new Matcher();
    this.contextMatchers = new Object();
    this.dialogueMatchers = new Object();
    this.question="";
}

Chatbot.prototype = {
    addRule : function(rule) {
        if (typeof rule.dialogueId != "undefined"  && rule.dialogueId != null) {
            this.dialogueMatchers[rule.dialogueId] = this.dialogueMatchers[rule.dialogueId]
                    || (new Matcher());
            // console.log("adding dialogue: " + rule.dialogueId);
            // console.log("adding dialogue: " + rule.inputs.join());
            this.dialogueMatchers[rule.dialogueId].addInputs(rule.inputs);
            return;
        }
        if (typeof rule.inputs != "undefined" && rule.inputs != null) {
            // console.log("adding generic matcher: " + rule.inputs.join());
            this.mainMatcher.addInputs(rule.inputs);
        }
        if (typeof rule.context != "undefined" && rule.context != null 
                && typeof rule.cinputs != "undefined" && rule.cinputs !=null) {
            this.contextMatchers[rule.context] = this.contextMatchers[rule.context]
                    || (new Matcher());
            // console.log("adding context matcher: " + rule.context);
            // console.log("adding context matcher: " + rule.cinputs.join());
            this.contextMatchers[rule.context].addInputs(rule.cinputs);
        }
    },
    
    addRules : function(){
        // добавление правил циклом. все правила - объект
    },

    answer : function(question, cb) {
        console.log(question);
        this.question = question;
        var foundInput = null;
        if (this.dialogueId.length > 0) {
            if (typeof this.dialogueMatchers[this.dialogueId] !== "undefined") {
                console.log("dialogue mode");
                foundInput = this.dialogueMatchers[this.dialogueId].findAnswer(question);
            }
            this.dialogueId = "";
        }
        if (foundInput == null) {
            if (this.context.length > 0) {
                if (typeof this.contextMatchers[this.context] !== "undefined") {
                    console.log("-- context mode", this.context);
                    foundInput = this.contextMatchers[this.context].findAnswer(question);
                }
                this.context = "";
            }
        }
        if (foundInput == null) {
            console.log("-- generic mode");
            foundInput = this.mainMatcher.findAnswer(question);
        }
        if (foundInput != null) {
            console.log("execute: " + foundInput, ",cb - ", chatbot);
            foundInput.rule.execute();
        }
        cb(chatbot.response);
    },
    
    //
    answerCinputs : function(currentRule, nextContext){
        console.log("answerCinputs - ", currentRule, nextContext)
        if (nextContext == null){
            nextContext = currentRule.context
        }
        // очистка Input Cinputs из строки запроса
        wordsToDelete = currentRule.inputs.concat(currentRule.cinputs)
        console.log("words2delete - ", wordsToDelete)
        var question = chatbot.question.split(" ")
        console.log("clearMe - ", question)
        var clearedQuestion = literacy.deleteWords(wordsToDelete, question)
        clearedQuestion = clearedQuestion.join(" ")
        //
        chatbot.context = nextContext
        if(clearedQuestion!=""){
            chatbot.answer(clearedQuestion)
        }
    },

    /*
    // фильтрация товара по содержанию Properties
    filterGoodsByQuestion : function(question){
        var accuracy = 1 // точность вхождения запроса
        var limit = Math.round(question.length * accuracy) // accuracy в цифрах
        var field = "properties"
        var output = []
        var weight = []
        var propFrequency = []
        // на выходе массив weight - количество слов в описании товара, соответствующих запросу
        for(i = 0; i < goods.length; i++){
            weight[i] = {
                "id" : goods[i]["id"], // id товара
                "index" : 0, // количество вхождений свойств из запроса
                "foundProperties" : [], // TODO найденные свойства
            }
            for(j = 0; j < question.length; j++){
                for(k = 0; k < goods[i][field].length; k++){
                    if(question[j] == goods[i][field][k]){
                        weight[i]["index"] ++
                        weight[i]["foundProperties"].push(goods[i][field][k])
                        console.log("found = " + question[j] + '=, id - ' + goods[i]['id'])
                    }
                }
            }
        }
        // обрезаем все товары, вхождение которых меньше accuracy
        for (i in weight){
            if (Math.round(weight[i]["index"] * accuracy) < limit){
                delete(weight[i])
            }
        }
        // сортируем по убыванию весов
        weight.sort(function(a, b){
            return b["index"] - a["index"]
        })
        // выводим в output товары по id из weight
        for (i in weight){
            for(j = 0; j < goods.length; j++){
                if(weight[i]["id"] == goods[j]["id"]){
                    output.push(goods[j])
                }
            }
        }
        return(output)
    },
    
    // Ответ с рейтингом
    answerRating : function(currentRule, nextContext){
        var maxGoods = 3 //макс.количество товаров в ответе
        console.log("answerRating - ", currentRule, nextContext)
        if (nextContext == null){
            chatbot.context = ''
        }
        // очистка Input из строки запроса
        wordsToDelete = currentRule.inputs
        var question = chatbot.question.split(" ")
        var clearedQuestion = literacy.deleteWords(wordsToDelete, question)
        // очистка всех слов, которые не относятся к характеристикам товаров
        clearedQuestion = literacy.retainWords(dictSys.goodsProperties, clearedQuestion)
        if(clearedQuestion.length != 0){
            // добавляем в filteredGoods массив товаров, которые соответствуют вопросу
            filteredGoods = (chatbot.filterGoodsByQuestion(question))
            if(filteredGoods.length != 0){
                filteredGoods = chatbot.filterGoodsByRating(filteredGoods, maxGoods)
                chatbot.response = chatbot.constructAnswerGoodsRating(filteredGoods)
            }
        }
    },
    
    filterGoodsByRating : function(goodsToFilter, maxGoods){
        var output = []
        //  TODO сначала грруппу
        // сортируем по убыванию рейтинга
        goodsToFilter.sort(function(a, b){
            return b["rating"] - a["rating"]
        })
        // выводим maxGoods товаров в output
        if(goodsToFilter.length > maxGoods){
            for(i = 0; i < maxGoods; i++){
                output.push(goodsToFilter[i])
            }
        } else{
            output = goodsToFilter
        }
        return(output)
    },
    
    constructAnswerGoodsRating : function(goodsToShow){
        var answer = "Товары по Вашему запросу, с самыми высокими оценками: <hr>"
        //console.log("вот:", goodsToShow, goodsToShow.length)
        for(i = 0; i < goodsToShow.length; i++){
            switch (Math.round(goodsToShow[i]["rating"])){
                case 1:
                  ratingPicture = "img/rate1.png"
                  break
                case 2:
                  ratingPicture = "img/rate2.png"
                  break
                case 3:
                  ratingPicture = "img/rate3.png"
                  break
                case 4:
                  ratingPicture = "img/rate4.png"
                  break
                case 5:
                  ratingPicture = "img/rate5.png"
                  break
                default:
                  ratingPicture = "img/rate0.png"
            }
            if(goodsToShow[i]["comments"] == undefined){
                goodsToShow[i]["commentsLength"] = 0;
            }
            else{
                goodsToShow[i]["commentsLength"] = goodsToShow[i]["comments"].length;
            }
            var cardId = Math.floor(Math.random() * (999 - 1)) + ":" + goodsToShow[i]['id'];
            answer += '<a id="' + cardId + '" onclick="showFullCard(this)"><div class="product-card-small"><div class="image" style="background-image: url(' + goodsToShow[i]["picture"] + ')"></div><div class="info"><div class="header-wrapper"><div class="name-wrapper"><div class="product-name">' + goodsToShow[i]["name"] + '</div><div class="price light-branded-color-background">' + goodsToShow[i]["price"] + ' руб.</div></div></div><div class="rate-wrapper"><div class="rate-col"><img src="' + ratingPicture + '"></div><div class="rate-col">' + goodsToShow[i]["rating"] + '</div><div class="rate-col"><img src="img/comments.png"></div><div class="rate-col">' + goodsToShow[i]["commentsLength"] + '</div></div></div></div></a>'
        }
        answer += '<hr>Хотите узнать оценки других товаров?';
        return(answer)
    },
    
    // ответ с ценой
    answerPriceOfGood : function(currentRule, nextContext){
        var maxGoods = 3 //макс.количество товаров в ответе
        console.log("answerPrice - ", currentRule, nextContext)
        if (nextContext == null){
            chatbot.context = ''
        }
        // очистка Input из строки запроса
        wordsToDelete = currentRule.inputs
        var question = chatbot.question.split(" ")
        var clearedQuestion = literacy.deleteWords(wordsToDelete, question)
        // очистка всех слов, которые не относятся к характеристикам товаров
        clearedQuestion = literacy.retainWords(dictSys.goodsProperties, clearedQuestion)
        if(clearedQuestion.length != 0){
            // добавляем в filteredGoods массив товаров, которые соответствуют вопросу
            filteredGoods = (chatbot.filterGoodsByQuestion(question))
            if(filteredGoods.length != 0){
                filteredGoods = chatbot.filterGoodsByPrice(filteredGoods, maxGoods)
                chatbot.response = chatbot.constructAnswerGoodsPrice(filteredGoods)
            }
        }
    },
    
    filterGoodsByPrice : function(goodsToFilter, maxGoods){
        var output = []
        // сортируем по возрастанию рейтинга
        //goodsToFilter.sort(function(a, b){
        //    return a["price"] - b["price"]
        //})
        // выводим maxGoods товаров в output
        if(goodsToFilter.length > maxGoods){
            for(i = 0; i < maxGoods; i++){
                output.push(goodsToFilter[i])
            }
        } else{
            output = goodsToFilter
        }
        return(output)
    },
    
    constructAnswerGoodsPrice : function(goodsToShow){
        var answer = "Товары по Вашему запросу найдены: <hr>"
        //console.log("вот:", goodsToShow, goodsToShow.length)
        for(i = 0; i < goodsToShow.length; i++){
            switch (Math.round(goodsToShow[i]["rating"])){
                case 1:
                  ratingPicture = "img/rate1.png"
                  break
                case 2:
                  ratingPicture = "img/rate2.png"
                  break
                case 3:
                  ratingPicture = "img/rate3.png"
                  break
                case 4:
                  ratingPicture = "img/rate4.png"
                  break
                case 5:
                  ratingPicture = "img/rate5.png"
                  break
                default:
                  ratingPicture = "img/rate0.png"
            }
            if(goodsToShow[i]["comments"] == undefined){
                goodsToShow[i]["commentsLength"] = 0;
            }
            else{
                goodsToShow[i]["commentsLength"] = goodsToShow[i]["comments"].length;
            }
            var cardId = Math.floor(Math.random() * (999 - 1)) + ":" + goodsToShow[i]['id'];
            answer += '<a id="' + cardId + '" onclick="showFullCard(this)"><div class="product-card-small"><div class="image" style="background-image: url(' + goodsToShow[i]["picture"] + ')"></div><div class="info"><div class="header-wrapper"><div class="name-wrapper"><div class="product-name">' + goodsToShow[i]["name"] + '</div><div class="price light-branded-color-background">' + goodsToShow[i]["price"] + ' руб.</div></div></div><div class="rate-wrapper"><div class="rate-col"><img src="' + ratingPicture + '"></div><div class="rate-col">' + goodsToShow[i]["rating"] + '</div><div class="rate-col"><img src="img/comments.png"></div><div class="rate-col">' + goodsToShow[i]["commentsLength"] + '</div></div></div></div></a>'
        }
        answer += '<hr>Хотите узнать цены других товаров?';
        return(answer)
    },
    
    // price best
    answerBestPrice : function(currentRule, nextContext){
        var maxGoods = 3 //макс.количество товаров в ответе
        console.log("answerBestPrice - ", currentRule, nextContext)
        if (nextContext == null){
            chatbot.context = ''
        }
        // очистка Input из строки запроса
        wordsToDelete = currentRule.inputs
        var question = chatbot.question.split(" ")
        var clearedQuestion = literacy.deleteWords(wordsToDelete, question)
        // очистка всех слов, которые не относятся к характеристикам товаров
        clearedQuestion = literacy.retainWords(dictSys.goodsProperties, clearedQuestion)
        if(clearedQuestion.length != 0){
            // добавляем в filteredGoods массив товаров, которые соответствуют вопросу
            filteredGoods = (chatbot.filterGoodsByQuestion(question))
            if(filteredGoods.length != 0){
                filteredGoods = chatbot.filterGoodsByBestPrice(filteredGoods, maxGoods)
                chatbot.response = chatbot.constructAnswerGoodsBestPrice(filteredGoods)
            }
        }
    },
    
    filterGoodsByBestPrice : function(goodsToFilter, maxGoods){
        var output = []
        // сортируем по возрастанию рейтинга
        goodsToFilter.sort(function(a, b){
            return a["price"] - b["price"]
        })
        // выводим maxGoods товаров в output
        if(goodsToFilter.length > maxGoods){
            for(i = 0; i < maxGoods; i++){
                output.push(goodsToFilter[i])
            }
        } else{
            output = goodsToFilter
        }
        return(output)
    },
    
    constructAnswerGoodsBestPrice : function(goodsToShow){
        var answer = "Товары по вашму запросу с самыми низкими ценами: <hr>"
        //console.log("вот:", goodsToShow, goodsToShow.length)
        for(i = 0; i < goodsToShow.length; i++){
            switch (Math.round(goodsToShow[i]["rating"])){
                case 1:
                  ratingPicture = "img/rate1.png"
                  break
                case 2:
                  ratingPicture = "img/rate2.png"
                  break
                case 3:
                  ratingPicture = "img/rate3.png"
                  break
                case 4:
                  ratingPicture = "img/rate4.png"
                  break
                case 5:
                  ratingPicture = "img/rate5.png"
                  break
                default:
                  ratingPicture = "img/rate0.png"
            }
            if(goodsToShow[i]["comments"] == undefined){
                goodsToShow[i]["commentsLength"] = 0;
            }
            else{
                goodsToShow[i]["commentsLength"] = goodsToShow[i]["comments"].length;
            }
            var cardId = Math.floor(Math.random() * (999 - 1)) + ":" + goodsToShow[i]['id'];
            answer += '<a id="' + cardId + '" onclick="showFullCard(this)"><div class="product-card-small"><div class="image" style="background-image: url(' + goodsToShow[i]["picture"] + ')"></div><div class="info"><div class="header-wrapper"><div class="name-wrapper"><div class="product-name">' + goodsToShow[i]["name"] + '</div><div class="price light-branded-color-background">' + goodsToShow[i]["price"] + ' руб.</div></div></div><div class="rate-wrapper"><div class="rate-col"><img src="' + ratingPicture + '"></div><div class="rate-col">' + goodsToShow[i]["rating"] + '</div><div class="rate-col"><img src="img/comments.png"></div><div class="rate-col">' + goodsToShow[i]["commentsLength"] + '</div></div></div></div></a>'
        }
        answer += '<hr>Хотите узнать про низкие цены других товаров?';
        return(answer)
    },
    
    // nutrition
    answerNutrition : function(currentRule, nextContext){
        // chatbot.response = 'ghbdtn'
        // var maxGoods = 3 //макс.количество товаров в ответе
        // console.log("answerNutrition - ", currentRule, nextContext)
        // if (nextContext == null){
        //     chatbot.context = ''
        // }
        // // очистка Input из строки запроса
        // wordsToDelete = currentRule.inputs
        // var question = chatbot.question.split(" ")
        // var clearedQuestion = literacy.deleteWords(wordsToDelete, question)
        // // очистка всех слов, которые не относятся к характеристикам товаров
        // clearedQuestion = literacy.retainWords(dictSys.goodsProperties, clearedQuestion)
        // if(clearedQuestion.length != 0){
        //     // добавляем в filteredGoods массив товаров, которые соответствуют вопросу
        //     filteredGoods = (chatbot.filterGoodsByQuestion(question))
        //     if(filteredGoods.length != 0){
        //         filteredGoods = chatbot.filterGoodsByNutrition(filteredGoods, maxGoods)
        //         chatbot.response = chatbot.constructAnswerGoodsNutrition(filteredGoods)
        //     }
        // }
    },
    
    filterGoodsByNutrition : function(goodsToFilter, maxGoods){
        var output = []
        // сортируем по возрастанию рейтинга
        //goodsToFilter.sort(function(a, b){
        //    return a["price"] - b["price"]
        //})
        // выводим maxGoods товаров в output
        if(goodsToFilter.length > maxGoods){
            for(i = 0; i < maxGoods; i++){
                output.push(goodsToFilter[i])
            }
        } else{
            output = goodsToFilter
        }
        return(output)
    },
    
    constructAnswerGoodsNutrition : function(goodsToShow){
        var answer = "Энергетическая ценность товаров по вашему запросу: <hr>"
        for(i = 0; i < goodsToShow.length; i++){
            var cardId = Math.floor(Math.random() * (999 - 1)) + ":" + goodsToShow[i]['id'];
            answer += '<a id="' + cardId + '" onclick="showFullCard(this)"><div class="product-card-small nutrition"><div class="image" style="background-image: url(' + goodsToShow[i]["picture"] + ')"></div><div class="info"><div class="header-wrapper-nutrition"><div class="name-wrapper"><div class="product-name">' + goodsToShow[i]["name"] + '</div></div></div><div class="nutrition-wrapper"><div class="nutrition-col"><div class="header">Ккал</div><div class="value border-right">' + goodsToShow[i]["callories"] + '</div></div><div class="nutrition-col"><div class="header">Б.</div><div class="value border-right">' + goodsToShow[i]["protein"] + '</div></div><div class="nutrition-col"><div class="header">Ж.</div><div class="value border-right">' + goodsToShow[i]["fat"] + '</div></div><div class="nutrition-col"><div class="header">У.</div><div class="value">' + goodsToShow[i]["carbs"] + '</div></div></div></div></div></a>'
        }
        answer += '<hr>Хотите узнать про другие товары?';
        return(answer)
    },
    */



    // check categories
    checkCategories: (currentRule, nextContext) => {
        nextContext = nextContext || '';
        let response;
        let question = chatbot.question.split(' ');
        console.log(chatbot);
        if (question.includes('пицца')) {
            let name = chatbot.getEntity('name', question);
            let ingredients = chatbot.getEntity('ingredient', question);
            let size = chatbot.getEntity('size', question);
            let taste = chatbot.getEntity('taste', question);
            console.log(name, ingredients, size, taste);
            if (name || ingredients || size || taste) {
                chatbot.choosePizza(currentRule, "Выбор пиццы");
            }
            else {
                response = 'Расскажи подробнее, какую пиццу ты хочешь?';
                nextContext = 'Выбор пиццы';
            }
        } else {
            response = 'Извини, дружок, но мы делаем только пиццу. Зато какую! Хочешь пиццу?';
            nextContext = "Хочешь пиццы?";
        }
        chatbot.response = response;
        chatbot.context = nextContext;
    },

    chooseAssortiment: (currentRule, nextContext) => {
        nextContext = nextContext || '';
        let response;
        response = `Пока в нашем ресторане сеть только пицца. Хочешь пиццу?`
        chatbot.response = response;
        chatbot.context = nextContext;
    },

    getPizzaAssortiment: (currentRule, nextContext) => {
        nextContext = nextContext || '';
        let response;
        let names = chatbot.findPizzaNameByParams();
        names = quoteStrings(names);
        names = names.join(', <br>');
        response = `we have some pizzas,<br> <b>${names}</b>`;
        chatbot.response = response;
        chatbot.context = nextContext;
    },

    choosePizza: (currentRule, nextContext) => {
        nextContext = nextContext || '';
        let response = '';
        let question = chatbot.question.split(' ');
        let memory = chatbot.memory.pizza;
        let name = chatbot.getEntity('name', question);
        console.log('name', name);
        let ingredients = chatbot.getEntity('ingredient', question);
        console.log('ingredient', ingredients);
        let size = chatbot.getEntity('size', question);
        console.log('size', size);
        let taste = chatbot.getEntity('taste', question);
        console.log('taste', taste);
        if (ingredients) {
            ingredients.forEach((i) => {
                if(!memory.ingredients.includes(i)) {
                    memory.ingredients.push(i);
                }
            })
        };
        if (size) {
            memory.size = size[0];
        }
        if (taste) {
            taste.forEach((t) => {
                if(!memory.taste.includes(t)) {
                    memory.taste.push(t);
                }
            })
        }
        if (!memory.name && name) {
            memory.name = name;
        }
        else if (memory.name && memory.name != name) {
            memory.name = name;
        }
        // let someParam = (memory.size || memory.ingredients.length != 0 || memory.taste.length != 0) ? true : false;
        let someParam = (memory.size || memory.ingredients.length != 0) ? true : false;
        console.log('someParam', someParam);
        if (memory.name) {
            if (memory.name.length > 1) {
                chatbot.memory.pizza.namesToChooseFrom = memory.name;
                let names = quoteStrings(memory.name);
                names = names.join(',<br>');
                response = `Я поняла, что вы сказали несколько названий пиццы:<br> <b>${names}</b>. `;
                response += `<br>Какую бы из них вы хотели заказать? `;
                nextContext = 'Уточнение названия';
            } else if (memory.name.length = 1) {
                let name = quoteStrings(memory.name[0]);
                memory.name = memory.name[0];
                response = `Вы выбрали пиццу <b>${name}</b>. `;
                if (memory.size) {
                    memory.price = 0;
                    response += `<br>Размер - "${memory.size}". `;
                    response += `<br>Стоимость заказа - ${memory.price}руб. `;
                    response += `<br>Всё верно?`;
                    nextContext = 'Подтверждение заказа';
                } else {
                    response += `<br>Я правильно вас поняла? `;
                    nextContext = 'Уточнение размера';
                }
            }

        } else if (!memory.name && someParam) {
            let names = chatbot.findPizzaNameByParams();
            if (names) {
                let namesCount = names.length;
                chatbot.memory.pizza.namesToChooseFrom = names;
                names = quoteStrings(names);
                names = names.join(',<br>');
                if (namesCount > 1) {
                    response = `По вашему запросу найдены пиццы со следующими названиями:<br> <b>${names}</b>. `;
                    response += '<br>Какую бы вы хотели отведать?';
                    nextContext = 'Уточнение названия';
                } else {
                    response = `По-моему, под ваш вопрос больше всего подходит пицца <b>${names}</b>`;
                    response += `Хотите заказать эту пиццу?`;
                    nextContext = 'Уточнение размера';
                }
            } else {
                response = `Извини, я не могу подобрать пиццу по твоему запросу. Уточни, какую именно пиццу ты хочешь заказать? Попробуй по названию, ингридиентам, или опиши вкус.`;
                nextContext = 'Выбор пиццы';
            }
        } else if (!memory.name && !someParam) {
            response = `Какую именно пиццу ты хочешь заказать? Попробуй вспомнить название, или ингридиент.`;
            nextContext = 'Выбор пиццы';
        }

        chatbot.response = response;
        chatbot.context = nextContext;
    },

    clarifyPizzaSize: (currentRule, nextContext) => {
        let response = '';
        let question = chatbot.question;
        let memory = chatbot.memory.pizza;
        if (!memory.name && memory.namesToChooseFrom) memory.name = memory.namesToChooseFrom[0];
        let yes = chatbot.getEntity('yes', question);
        
        let size = chatbot.getEntity('size', question);
        if (!memory.size) {
            memory.size = size[0];
        }
        if (memory.size && size && memory.size != size) {
            memory.size = size[0];
        }
        
        if (!memory.size) {
            let sizes = chatbot.getGoodsParam('пицца', memory.name, 'size');
            if (sizes) {
                sizes = quoteStrings(sizes);
                sizes = sizes.join(', <br>');
                response += `Мы выпекаем эту пиццу такого размера: ${sizes}. `;
                response += `<br>Какой вам больше нравится?`;
                nextContext = "Уточнение размера";
            }
        } else {
            let chosenGoods = chatbot.filterGoodsByParam('пицца', 'name', memory.name);
            let firstName = Object.keys(chosenGoods)[0];
            let chosenGood = chosenGoods[firstName];
            memory.price = chosenGood.size[memory.size];
            response += `Размер - "${memory.size}". `;
            response += `<br>Цена заказа - ${memory.price}руб. `;
            response += `<br>Всё верно?`;
            nextContext = 'Подтверждение заказа';
        }
        chatbot.response = response;
        chatbot.context = nextContext;
    },

    clarifyPizzaName: (currentRule, nextContext) => {
        let numeral = chatbot.getNumeral(chatbot.question);
        let memory = chatbot.memory.pizza;
        let question = chatbot.question.split(' ');
        let name;
        let response = ``;
        if (numeral && numeral <= memory.namesToChooseFrom.length) {
            name = memory.namesToChooseFrom[numeral - 1];
            console.log(name);
        } else {
            name = chatbot.getEntity('name', question);
            console.log(name);
        }
        let chosenGoods = chatbot.filterGoodsByParam('пицца', 'name', name);
        if (chosenGoods) {
            console.log(chosenGoods);
            let firstName = Object.keys(chosenGoods)[0];
            let chosenGood = chosenGoods[firstName];
            console.log(firstName, chosenGood);
            memory.name = chosenGood.name;
            response += `Вы выбрали пиццу <b>"${memory.name}"</b>. `;
            if (memory.size) {
                memory.price = chosenGood.size[memory.size];
                response += `<br>Размер - "${memory.size}". `;
                response += `<br>Цена заказа - ${memory.price}руб. `;
                response += `<br>Всё верно?`;
                nextContext = 'Подтверждение заказа';
            } else {
                let sizes = chatbot.getGoodsParam('пицца', chosenGood.name, 'size');
                if (sizes) {
                    sizes = quoteStrings(sizes);
                    sizes = sizes.join(', <br>');
                    response += `<br>Уточните размер пожалуйста. Доступны следующие размеры пиццы:<br> <b>${sizes}</b>. `;
                    response += `<br>Какой размер хотите?`;
                    nextContext = "Уточнение размера";
                }
            }
        } else {
            response = `Не могу понять, какую пиццу вы выбрали. Повторите пожалуйста.`;
            nextContext = 'Выбор пиццы';
        }
        chatbot.response = response;
        chatbot.context = nextContext;
    },

    completeOrder: (currentRule, nextContext) => {
        let memory = chatbot.memory.pizza;
        let response = '';
        response += `Ваш заказ:`;
        response += `<br>Пицца "${memory.name}".`
        response += `<br>Размер - "${memory.size}".` 
        response += `<br>Стоимость заказа - ${memory.price}руб.`;
        response += `<br>Лови свою пиццу, дружок!`;
        response += '<br><br><b>Я всё забыл, моя память чиста.</b>';
        response += "<br>Привет!. Добро пожаловать в наш магазинчик и все такое. Чего хочешь?";
        chatbot.response = response;
        chatbot.context = '';
        chatbot.clearPizzaMemory();
    },

    findPizzaNameByParams: () => {
        let memory = chatbot.memory.pizza;
        let filteredGoods;
        if (memory.size) {
            let filteredBySize = chatbot.filterGoodsByParam('пицца', 'size', memory.size);
            if (filteredBySize) {
                filteredGoods = filteredBySize;
                console.log('filtered by size', filteredGoods);
                if (memory.ingredients){
                    let filteredByIngredients = chatbot.filterGoodsByParam('пицца', 'ingredients', memory.ingredients, filteredBySize);
                    if(filteredByIngredients) {
                        filteredGoods = filteredByIngredients;
                        console.log('filtered by ingredients', filteredGoods);
                        // let filteredByTaste = chatbot.filterGoodsByParam('пицца', 'ingredients', memory.ingredients, filteredBySize);
                    }
                }
            }
        } else if (memory.ingredients.length) {
            let filteredByIngredients = chatbot.filterGoodsByParam('пицца', 'ingredients', memory.ingredients);
            if(filteredByIngredients) {
                filteredGoods = filteredByIngredients;
            }
        }
        let result = [];
        let limit = 3;
        if (!filteredGoods) {
            for (var key in goods) {
                result.push(goods[key].name)
                limit--
                if (!limit) break;
            }
        }
        else {
            for (var name in filteredGoods) {
                if (limit) result.push(name);
                limit--;
                if (!limit) break;
            }
        }
        return result;
    },

    filterGoodsByParam: (category, param, value, filteredGoods) => {
        let goodsToFilter;
        category = category.toLowerCase();
        if (filteredGoods) {
            goodsToFilter = [];
            for (let key in filteredGoods) {
                if (filteredGoods.hasOwnProperty(key)) {
                    let element = filteredGoods[key];
                    goodsToFilter.push(element);
                }
            }
        } else {
            goodsToFilter = goods;
        }
        let result = {};
        let vArray;
        if (typeof(value) == 'string') {
            value = value.toLowerCase();
            vArray = value.split(' ');
        } else {
            vArray = value;
            for (let i = 0; i < vArray.length; i++) {
                vArray[i] = vArray[i].toLowerCase();
            }
        }
        goodsToFilter.forEach((g) => {
            if (g.category.toLowerCase() == category) {
                if (typeof(g[param]) == 'object') {
                    if(Array.isArray(g[param])) {
                        g[param].forEach((p) => {
                            if(vArray.includes(p.toLowerCase())) {
                                result[g.name] = g;
                            } else {
                                let pArray = p.split(' ');
                                vArray.forEach((v) => {
                                    if (pArray.includes(v)) {
                                        result[g.name] = g;
                                    }
                                })
                            }
                        })
                    }
                    else {
                        if (g[param].hasOwnProperty(value)) {
                            result[g.name] = g;
                        }
                    }
                } else if (typeof(g[param] == 'string')) {
                    let p = g[param].toLowerCase();
                    p = p.split(' ');
                    p.forEach((word) => {
                        vArray.forEach((v) => {
                            v = v.split(' ');
                            v.forEach((vWord) => {
                                if (vWord == word) result[g.name] = g
                            })
                        })
                        // if(vArray.includes(word)) result[g.name] = g;
                    })
                }
            }
        })
        return result;
    },

    getGoodsParam: (category, name, param) => {
        category = category.toLowerCase();
        name = name.toLowerCase();
        param = param.toLowerCase();
        let results;
        let gCategory, gName, gParam;
        goods.forEach((g) => {
            gCategory = g.category.toLowerCase();
            gName = g.name.toLowerCase();
            if (gCategory == category && gName == name) {
                results = g[param];
            }
        })
        return results;
    },

    getAllEntities: (e) => {
        if (dict.entities.hasOwnProperty(e)) {
            let entity = dict.entities[e];
            return entity;
        } else return false;
    },
    getEntity: (entity, question) => {
        let unexpected = new RegExp('пицца', 'ig');
        if (typeof(question) == 'string') {
            question = question.split(' ');
        }
        let entities = chatbot.getAllEntities(entity);
        let results = [];
        if (entities) {
            question.forEach((q) => {
                if (q.search(unexpected) == -1) {
                    entities.forEach((e) => {
                        let eArray = e.split(' ');
                        if (eArray.includes(q)) results.push(e);
                    })
                }
            })
        }
        if (results.length != 0) {
            return results
        } else return false;
    },
    getNumeral: (question) => {
        if (typeof(question) == 'string') question = question.split(' ');
        let result = false;
        for (var number in dict.numeralsMap) {
            dict.numeralsMap[number].forEach((n) => {
                if(question.includes(n) || question.includes(number)) result = number;
            })
        }
        return result;
    },

    clearPizzaMemory: () => {
        chatbot.memory.category = null;
        chatbot.memory.pizza = {}
        chatbot.memory.pizza.price = null;
        chatbot.memory.pizza.name = null;
        chatbot.memory.pizza.namesToChooseFrom = [];
        chatbot.memory.pizza.taste = [];
        chatbot.memory.pizza.size = null;
        chatbot.memory.pizza.ingredients = [];
    }
}

function quoteStrings(s) {
    let q = `"`;
    let result;
    if (Array.isArray(s)) {
        result = [];
        for (let i = 0; i < s.length; i++) {
            result[i] = q + s[i] + q;
        }
    } else if(typeof(s) == 'object') {
        result = Object.keys(s);
        for (let i = 0; i < result.length; i++) {
            result[i] = q + result[i] + q;
        }
    } else if(typeof(s) == 'string') {
        result = q + s + q;
    }
    return result;
}

var chatbot = new Chatbot();
chatbot.clearPizzaMemory();

module.exports = Chatbot;
