//inputs, cinputs, context, responses, action, dialogueId


answers={}
answers.notUnderstand = ["Я вас не понимаю. Попробуйте по-другому задать вопрос.", "Извините, я вас не понял. Попробуйте по-другому задать вопрос.", "Я конечно многое могу, но вот сейчас я не понял, чего вы от меня хотите. Попробуйте спросить по-другому.", "Я вас не понимать. Попробуйте перефразировать вопрос.", "Не понимаю я вас. Уточните вопрос."]
answers.whatCanIDo = ["Чем еще могу быть полезен?", "Чего еще пожелаете?", "Чем еще вам помочь?", "Еще есть вопросы? Спрашивай, не робей!", "Что-нибудь еще?"]
answers.ratingMain = ["Я могу сказать, у каких товаров самые лучшие отзывы. Уточните, про какую товарную группу вы хотели бы узнать.", "Я знаю, у каких товаров самые высокие рейтинги. Уточните пожалуйста товарную группу", "Я знаю, какие товары лучше. Но вам нужно уточнить, какая это группа", "С удовольствием отвечу, каке товары большего всего нравятся покупателям, Но вам надо уточнить название товара."]
answers.priceMain = ["Я могу сказать, сколько стоят товары. Но вам нужно уточнить группу.", "Я знаю всё о товарах. В том числе и цены. Уточните пожалуйста товар.", "Уточните пожалуйста товар.", "Я знаю цены товара. Уточните пожалуйста название."]
answers.clarifyGoods = ["Какой товар вас интересует?", "Уточните, какой товар?", "Какой товар?", "Какая группа товаров вас интересует?"]
answers.notFoundClarifyGoods = ["Возможно таких товаров у нас нет. Попробуйте по-другому задать вопрос", "Похоже таких товаров у нас нет. Попробуйте перефразировать вопрос", "Искал-искал, но ничего не нашел. Попробуйте спросить по-другому?", "Я очень старался найти ваш товар, или он где-то затерялся, или я не так вас понял. Попробуйте перефразировать вопрос."]
answers.nutritionMain = ["Я знаю все прокаллорийность товаров, но не могу понять, какой именно товар вам нужен. Уточните пожалуйста."]

var rule01 = new Rule(
    dict.gde.concat(dict.magaz),
    null,
    null,
    ["<img class='map' src='img/map.png'>"],
    null,
    null
)
chatbot.addRule(rule01);



// === рейтинг
// 1 уровень
var rule11 = new Rule(
    dict.rating,
    null,
    "Rating",
    answers.ratingMain,
    function(){
        chatbot.answerRating(this, "Rating")
        showLog("Act:")
    },
    null
)
chatbot.addRule(rule11);

// 2 уровень

var rule12 = new Rule(
    [],
    dictSys.goodsProperties,
    "Rating",
    answers.notFoundClarifyGoods,
    function(){
        chatbot.answerRating(this, "Rating")
        showLog("Act2:")
    },
    null
)
chatbot.addRule(rule12);

// отказы и соглашения

var rule13 = new Rule(
    [],
    dict.yes,
    "Rating",
    answers.clarifyGoods,
    function(){
        chatbot.answerRating(this, "Rating")
        showLog("Yes:")
    },
    null
)
chatbot.addRule(rule13);

var rule14 = new Rule(
    [],
    dict.no,
    "Rating",
    answers.whatCanIDo,
    function(){
        chatbot.answerRating(this, null)
        showLog("No:")
    },
    null
)
chatbot.addRule(rule14);


// === Цены - узнать цену товара
//1 уровень
var rule21 = new Rule(
    dict.price,
    null,
    "PriceOfGood",
    answers.priceMain,
    function(){
        chatbot.answerPriceOfGood(this, "PriceOfGood")
        showLog("Act1:")
    },
    null
)
chatbot.addRule(rule21);

//2 уровень
var rule22 = new Rule(
    [],
    dictSys.goodsProperties,
    "PriceOfGood",
    answers.notFoundClarifyGoods,
    function(){
        chatbot.answerPriceOfGood(this, "PriceOfGood")
        showLog("Act2:")
    },
    null
)
chatbot.addRule(rule22);

// отказы и соглашения

var rule23 = new Rule(
    [],
    dict.yes,
    "PriceOfGood",
    answers.clarifyGoods,
    function(){
        chatbot.answerPriceOfGood(this, "PriceOfGood")
        showLog("Yes:")
    },
    null
)
chatbot.addRule(rule23);

var rule24 = new Rule(
    [],
    dict.no,
    "PriceOfGood",
    answers.whatCanIDo,
    function(){
        chatbot.answerPriceOfGood(this, null)
        showLog("No:")
    },
    null
)
chatbot.addRule(rule24);


// === Цены - узнать Лучшую цену товара
//1 уровень
var rule31 = new Rule(
    dict.bestPrice,
    null,
    "BestPrice",
    answers.priceMain,
    function(){
        chatbot.answerBestPrice(this, "BestPrice")
        showLog("Act1:")
    },
    null
)
chatbot.addRule(rule31);

//2 уровень
var rule32 = new Rule(
    [],
    dictSys.goodsProperties,
    "BestPrice",
    answers.notFoundClarifyGoods,
    function(){
        chatbot.answerBestPrice(this, "BestPrice")
        showLog("Act2:")
    },
    null
)
chatbot.addRule(rule32);

// отказы и соглашения

var rule33 = new Rule(
    [],
    dict.yes,
    "BestPrice",
    answers.clarifyGoods,
    function(){
        chatbot.answerBestPrice(this, "BestPrice")
        showLog("Yes:")
    },
    null
)
chatbot.addRule(rule33);

var rule34 = new Rule(
    [],
    dict.no,
    "BestPrice",
    answers.whatCanIDo,
    function(){
        chatbot.answerBestPrice(this, null)
        showLog("No:")
    },
    null
)
chatbot.addRule(rule34);

/*
// === Скидки и акции
//1 уровень
var rule41 = new Rule(
    dict.sale,
    null,
    "Sale",
    answers.saleMain,
    function(){
        chatbot.answerSale(this, "Sale")
        showLog("Act1:")
    },
    null
)
chatbot.addRule(rule41);

//2 уровень
var rule42 = new Rule(
    [],
    dictSys.goodsProperties,
    "Sale",
    answers.notFoundClarifyGoods,
    function(){
        chatbot.answerSale(this, "Sale")
        showLog("Act2:")
    },
    null
)
chatbot.addRule(rule42);

// отказы и соглашения

var rule43 = new Rule(
    [],
    dict.yes,
    "Sale",
    answers.clarifyGoods,
    function(){
        chatbot.answerSale(this, "Sale")
        showLog("Yes:")
    },
    null
)
chatbot.addRule(rule43);

var rule44 = new Rule(
    [],
    dict.no,
    "Sale",
    answers.whatCanIDo,
    function(){
        chatbot.answerSale(this, null)
        showLog("No:")
    },
    null
)
chatbot.addRule(rule44);
*/



// === Калорийность
//1 уровень
var rule51 = new Rule(
    dict.nutrition,
    null,
    "Nutrition",
    answers.nutritionMain,
    function(){
        chatbot.answerNutrition(this, "Nutrition")
        showLog("Act1:")
    },
    null
)
chatbot.addRule(rule51);

//2 уровень
var rule52 = new Rule(
    [],
    dictSys.goodsProperties,
    "Nutrition",
    answers.notFoundClarifyGoods,
    function(){
        chatbot.answerNutrition(this, "Nutrition")
        showLog("Act2:")
    },
    null
)
chatbot.addRule(rule52);

// отказы и соглашения

var rule53 = new Rule(
    [],
    dict.yes,
    "Nutrition",
    answers.clarifyGoods,
    function(){
        chatbot.answerNutrition(this, "Nutrition")
        showLog("Yes:")
    },
    null
)
chatbot.addRule(rule53);

var rule54 = new Rule(
    [],
    dict.no,
    "Nutrition",
    answers.whatCanIDo,
    function(){
        chatbot.answerNutrition(this, null)
        showLog("No:")
    },
    null
)
chatbot.addRule(rule54);




// == Прочее
var ruleGreeting = new Rule(
    dict.hello, 
    null,
    null,
    [ "Привет! Чего хочешь?" ],
    null,
    null
);
chatbot.addRule(ruleGreeting);

var ruleMyPhoto = new Rule(
    dict.about, 
    null,
    "myPhoto",
    [ "Я - чат-робот. <br> <img src='img/me.jpg'>" ],
    null,
    null
);
chatbot.addRule(ruleMyPhoto);

var ruleHelp = new Rule(
    dict.help, 
    null,
    "help",
    [ "Я - чат-робот. Помогаю..." ],
    null,
    null
);
chatbot.addRule(ruleHelp);


// Дефолтный ответ
var ruleDef = new Rule(
    [ "default" ], 
    null,
    null,
    answers.notUnderstand,
    null,
    null
);
chatbot.addRule(ruleDef);


// аналитический язык!
var ruleanal = new Rule(
    ["медведь увидел охотника"], 
    null,
    null,
    ["увидел"],
    null,
    null
);
chatbot.addRule(ruleanal);

var ruleanal2 = new Rule(
    ["медведь поймал охотника"], 
    null,
    null,
    ["поймал"],
    null,
    null
);
chatbot.addRule(ruleanal2);

var ruleanal3 = new Rule(
    ["медведь охотника"], 
    null,
    null,
    ["ничего"],
    null,
    null
);
chatbot.addRule(ruleanal3);