answers = {}
answers.notUnderstand = ["Я вас не понимаю. Попробуйте по-другому задать вопрос.", "Извините, я вас не понял. Попробуйте по-другому задать вопрос.", "Я конечно многое могу, но вот сейчас я не понял, чего вы от меня хотите. Попробуйте спросить по-другому.", "Я вас не понимать. Попробуйте перефразировать вопрос.", "Не понимаю я вас. Уточните вопрос."]
answers.whatCanIDo = ["Чем еще могу быть полезен?", "Чего еще пожелаете?", "Чем еще вам помочь?", "Еще есть вопросы? Спрашивай, не робей!", "Что-нибудь еще?"]
answers.ratingMain = ["Я могу сказать, у каких товаров самые лучшие отзывы. Уточните, про какую товарную группу вы хотели бы узнать.", "Я знаю, у каких товаров самые высокие рейтинги. Уточните пожалуйста товарную группу", "Я знаю, какие товары лучше. Но вам нужно уточнить, какая это группа", "С удовольствием отвечу, каке товары большего всего нравятся покупателям, Но вам надо уточнить название товара."]
answers.priceMain = ["Я могу сказать, сколько стоят товары. Но вам нужно уточнить группу.", "Я знаю всё о товарах. В том числе и цены. Уточните пожалуйста товар.", "Уточните пожалуйста товар.", "Я знаю цены товара. Уточните пожалуйста название."]
answers.clarifyGoods = ["Какой товар вас интересует?", "Уточните, какой товар?", "Какой товар?", "Какая группа товаров вас интересует?"]
answers.notFoundClarifyGoods = ["Возможно таких товаров у нас нет. Попробуйте по-другому задать вопрос", "Похоже таких товаров у нас нет. Попробуйте перефразировать вопрос", "Искал-искал, но ничего не нашел. Попробуйте спросить по-другому?", "Я очень старался найти ваш товар, или он где-то затерялся, или я не так вас понял. Попробуйте перефразировать вопрос."]
answers.nutritionMain = ["Я знаю все прокаллорийность товаров, но не могу понять, какой именно товар вам нужен. Уточните пожалуйста."]

chatbot.addRule(new Rule(
    ['default'], // вопрос вне контекста
    null, // вопрос в контексте
    null, // контекст
    answers.notUnderstand, //дефолтный ответ
    null, //функция
    null // id диалога
))

chatbot.addRule(new Rule(
    ['очистка', 'забудь'], // вопрос вне контекста
    null, // вопрос в контексте
    null, // контекст
    answers.notUnderstand, //дефолтный ответ
    () => {
        chatbot.clearPizzaMemory();
        chatbot.response = 'я чист';
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    dict.entities.category, // вопрос вне контекста
    null, // вопрос в контексте
    "Категории", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.checkCategories(this, "Хочешь пиццы?");
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    dict.entities.whatNames.concat(dict.entities.questions), // вопрос вне контекста
    null, // вопрос в контексте
    "Категории", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.chooseAssortiment(this, "Хочешь пиццы?");
    }, //функция
    '11111111111111111' // id диалога
));

chatbot.addRule(new Rule(
    ['пицца'].concat(dict.entities.questions), // вопрос вне контекста
    null, // вопрос в контексте
    "Категории", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.getPizzaAssortiment(this, "Хочешь пиццы?");
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    [], // вопрос вне контекста
    dict.entities.yes, // вопрос в контексте
    "Хочешь пиццы?", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.choosePizza(this, "Выбор пиццы");
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    [], // вопрос вне контекста
    dict.entities.no, // вопрос в контексте
    "Хочешь пиццы?", // контекст
    ["Не хочешь - как хочешь. Если захочешь отведать вкусной пиццы - обращайся."], //дефолтный ответ
    () => {
        console.log('no!')
        chatbot.context = '';
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    dict.entities.name.concat(dict.entities.ingredient, dict.entities.taste, ['пицца']), // вопрос вне контекста
    null, // вопрос в контексте
    "Выбор пиццы", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.choosePizza(this, "Выбор пиццы");
    }, //функция
    null // id диалога
));


chatbot.addRule(new Rule(
    [], // вопрос вне контекста
    dict.entities.name.concat(dict.entities.numerals, dict.entities.yes), // вопрос в контексте
    "Уточнение названия", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.clarifyPizzaName(this, "Подтверждение заказа");
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    [], // вопрос вне контекста
    dict.entities.yes.concat(dict.entities.size), // вопрос в контексте
    "Уточнение размера", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.clarifyPizzaSize(this, "Подтверждение заказа");
    }, //функция
    null // id диалога
));

chatbot.addRule(new Rule(
    [], // вопрос вне контекста
    dict.entities.yes, // вопрос в контексте
    "Подтверждение заказа", // контекст
    null, //дефолтный ответ
    () => {
        chatbot.completeOrder(this, "Подтверждение заказа");
    }, //функция
    null // id диалога
));












// === Калорийность
//1 уровень
// var rule51 = new Rule(
//     dict.nutrition,
//     null,
//     "Nutrition",
//     answers.nutritionMain,
//     function(){
//         chatbot.answerNutrition(this, "Nutrition")
//         showLog("Act1:")
//     },
//     null
// )
// chatbot.addRule(rule51);

// //2 уровень
// var rule52 = new Rule(
//     [],
//     dict.goodsProperties,
//     "Nutrition",
//     answers.notFoundClarifyGoods,
//     // function(){
//     //     chatbot.answerNutrition(this, "Nutrition")
//     //     showLog("Act2:")
//     // },
//     null
// )
// chatbot.addRule(rule52);

// // отказы и соглашения
// var rule53 = new Rule(
//     [],
//     dict.yes,
//     "Nutrition",
//     answers.clarifyGoods,
//     // function(){
//     //     chatbot.answerNutrition(this, "Nutrition")
//     //     showLog("Yes:")
//     // },
//     null
// )
// chatbot.addRule(rule53);

// var rule54 = new Rule(
//     [],
//     dict.no,
//     "Nutrition",
//     answers.whatCanIDo,
//     // function(){
//     //     chatbot.answerNutrition(this, null)
//     //     showLog("No:")
//     // },
//     null
// )
// chatbot.addRule(rule54);
