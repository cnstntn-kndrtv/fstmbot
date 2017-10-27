let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let Az = require('az');

let port = 3000;


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', function(socket) {
    console.log('socket ' + socket.id + ' connected');
    socket.emit('bot message', {text:'Привет, дружок!'});
    socket.emit('bot message', {text:'Я Папа Джонс. Ты можешь заказать у меня доставку пиццы.'});
    socket.emit('bot message', {text:'Скажи название, или ингредиенты и я подберу тебе несколько лучших варинтов.'});
    socket.emit('bot message', {text:'Попробуй задать вопрос "Хочу большую пиццу с сыром", или "Хочу пиццу которая назвается Чикен что-то там"'});
    chatbot.clearPizzaMemory();
    
    socket.on('user message', (user, msg) => {
        let clearedQuestion = literacy.clear(msg);
        chatbot.answer(clearedQuestion, (reply) => {
            socket.emit('bot message', {text: reply})
        });
    })
})

http.listen(port, function() {
    console.log('module:', module.id);
    console.log('listening on *:', port);
});



// literacy
// Проверка грамотности
function Literacy() {
    //
}

Literacy.prototype = {
    
    clear: function(string) {
        var question = string.trim(); // удаляем лишние пробелы
        question = question.toLowerCase() // в нижний регистр
        question = literacy.deletePunctuations(question); // удаляем знаки препинания
        var questionArray = question.split(" "); // разбиваем Вопрос на массив
        // TODO к каждому слову - поиск опечаток
        // questionArray = literacy.retainWords(dict.allWords, questionArray); // оставляем в Вопросе только слова, которые есть словаре
        // TODO удалить дубликаты слов
        // questionArray = literacy.normalizeWords(dict, questionArray)
        questionArray = literacy.getLemma(questionArray);
        // question = Az
        question = questionArray.join(" ") // опять собираем в строку
        console.log('cleared question', question);
        return(question);
    },
    
    collectWords: function(obj) {
        var words = []
        var t = typeof(obj)
        if (t != "object" || obj == null) return 0;
        for (x in obj){
            for(i = 0; i < obj[x].length; i++){
                words.push(obj[x][i].toLowerCase())
            }
        }
        return(words)
    },
    
    pushSpaceBeforePunctuations: function(string){
        var q;
        q = string.replace(/\!/g, ' !');
        q = q.replace(/\?/g, ' ?');
        return (q);
    },
    
    deletePunctuations: function(string){
        var q;
        q = string.replace(/\!/g, '');
        q = q.replace(/\?/g, '');
        q = q.replace(/\./g, '');
        q = q.replace(/\,/g, '');
        return (q);
    },
    
    normalizeWords: function(what, where){
        console.log("Нормализация слов. ДО: where - ", where)
        var output = []
        for(i = 0; i < where.length; i++){
            for (j in what){
                for(k = 0; k < what[j].length; k++){
                    if(where[i] == what[j][k] && j != "allWords"){
                        output.push(what[j][0])
                        console.log("нормализовано:", where[i], "=", what[j][k])
                    }
                }
            }
        }
        console.log("Нормализация слов. После: words - ", output)
        return (output)
    },

    getLemma: (words) => {
        let results = [];
        if (words) {
            let wasString = false;
            let wordsArray;
            if (typeof(words) == 'string') {
                wordsArray = words.split(' ');
                wasString = true;
            } else {
                wordsArray = words;
            }
            wordsArray.forEach((w) => {
                let parse = Az.Morph(w);
                let lemma = w;
                if (parse[0]) {
                    lemma = parse[0].normalize().toString();
                }
                results.push(lemma);
            })
            if (wasString) results = results.join(' ');
        } else results = words;
        return results;
    },
    
    deleteWords: function(what, where){ // удаляет слова массива what из where
        var output = where
        console.log("очистка слов. ДО: where - ", where)
        for(i = 0; i < where.length; i++){
            m = 0;
            for(j = 0; j < what.length; j++){
                if (where[i] == what[j]){
                    m++;
                }
            }
            if (m != 0){
                output.splice(i, 1)
                i--
            }
        }
        
        console.log("очистка слов. После: words - ", output)
        return (output)
    },
    
    retainWords: function(what, where){ // оставляет слова массива what в where
        var output = where;
        console.log("оставляем слова в строке. ДО: where - ", where);
        for(i = 0; i < where.length; i++){
            m = 0;
            for(j = 0; j < what.length; j++){
                if (where[i] == what[j]){
                    m++;
                }
            }
            if (m == 0){
                output.splice(i, 1);
                i--
            }
        }
        console.log("оставляем слова в строке. После: words - ", output)
        return (output)
    },

    clearPrepositions: (words) => {
        let wordsArray;
        let wasString = false;
        if (typeof(words) == 'string') {
            wordsArray = words.split(' ');
            wasString = true;
        } else {
            wordsArray = words;
        }
        let results = [];
        wordsArray.forEach((w) => {
            let parse = Az.Morph(w);
            let tag = parse[0].tag.POS;
            if (tag != 'PREP') {
                results.push(w);
            }
        });
        if (wasString) results = results.join(' ');
        return results;
    },
}

var literacy;
var dict = {}
var goods = [
    {
        "id": "p1",
        "category": "пицца",
        "name":"Супер Папа",
        "size": {
            "большой": 799,
            "маленький": 450,
            "средний": 600,
        },
        "description":"Пицца «Супер Папа» — фирменное блюдо нашего ресторана.",
        "taste": ["острый"],
        "ingredients":["фирменный соус", "сыр", "моцарелла", "пепперони", "колбаса", "свинина", "ветчина", "шампиньон", "перец", "лук", "оливки"],
    },
    {
        "id":"p2",
        "category":"пицца",
        "name":"Чикен Алоха с кисло-сладким соусом",
        "size": {
            "большой": 799,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца с оригинальным вкусом натуральной Алохи. Ты знаешь, что это? Я тоже. Закажи - поделишься впечатлениями!",
        "taste": ["экзотика", "кисло сладкий"],
        "ingredients":["Фирменное тесто", "соус кисло-сладкий чили", "грудка куриная", "курица", "лук", "зеленый перец", "красный перец", "ананас", "сыр", "Моцарелла"],
    },
    {
        "id":"p3",
        "category":"пицца",
        "name":"Сырный Цыпленок Кордон Блю",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца с куриным сыром. Горы белка в каждом куске! Ура уютным мягким бочкам! Утепляемся - зима близко!",
        "taste": ["сырный"],
        "ingredients":["фирменное тесто", "соус Шпинатный", "шпинат", "грудка куриная", "курица", "ветчина", "сыр", "Моцарелла"],
    },
    {
        "id":"p4",
        "category":"пицца",
        "name":"Любимая Пицца Джона",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Любимая пицца самого Папы. Что тут еще можно добавиьть!",
        "taste": ["сырный"],
        "ingredients":["Фирменный томатный соус", "пепперони", "ароматная свинина", "сыр", "моцарелла", "итальянские травы"],
    },
    {
        "id":"p5",
        "category":"пицца",
        "name":"Супер Чизбургер",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца «Чизбургер» — это настоящая находка для гурманов, избалованных гастрономическими деликатесами и желающих порадовать себя новым вкусом. Ведь она относится к тем блюдам, от которых просто невозможно оторваться.",
        "taste": ["сырный"],
        "ingredients":["Говядина", "бекон", "лук", "томат", "маринованный огурчик", "сыр моцарелла", "cоус Тысяча островов"],
    },
    {
        "id":"p6",
        "category":"пицца",
        "name":"Пепперони",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца «Пепперони» создана для любителей простых и одновременно оригинальных сочетаний. В начинку входят только качественные компоненты, что является главным секретом вкуса блюд. ",
        "taste": ["сырный"],
        "ingredients":["фирменный томатный соус", "пепперони", "сыр моцарелла"],
    },
    {
        "id":"p7",
        "category":"пицца",
        "name":"Сырная",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца «Сырная» считается одним из наиболее классических вариантов в меню «Папа Джонс».",
        "taste": ["сырный"],
        "ingredients":["Фирменный томатный соус", "сыр", "моцарелла"],
    },
    {
        "id":"p8",
        "category":"пицца",
        "name":"Гавайская",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Пицца «Гавайская» создана для любителей экзотики. Нежное сочетание ветчины и ананаса будоражит сознание гурманов со всего света. Раскрыть каждую ноту композиции помогает фирменный соус ресторана «Папа Джонс», состоящий из спелых калифорнийских томатов.",
        "taste": ["сырный"],
        "ingredients":["Фирменный томатный соус", "ветчина", "ананас", "сыр моцарелла"],
    },
    {
        "id":"p9",
        "category":"пицца",
        "name":"Мясная",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Хотите быстро пополнить запас протеина на целый день? Пицца «Мясная» из ресторана «Папа Джонс» поможет вам в этом!",
        "taste": ["сырный"],
        "ingredients":["Фирменный томатный соус", "пепперони", "ветчина", "бекон", "ароматная свинина", "говядина", "сыр моцарелла"],
    },
    {
        "id":"p10",
        "category":"пицца",
        "name":"Альфредо",
        "size": {
            "большой": 700,
            "маленький": 450,
            "средний": 600,
        },
        "description": "Классическая пицца Альфредо. Ветчина, грибочки, шпинат.",
        "taste": ["сырный"],
        "ingredients":["Ветчина", "бекон", "томат", "шампиньон", "соус", "Шпинатный", "шпинат", "сыр моцарелла"],
    },
]
var answers = {}

Az.Morph.init('./node_modules/az/dicts', () => {
    literacy = new Literacy();

    dict.entities = {
        "category": ["пицца", "десерт", "напиток"],
        "questions": ["что есть", "у вас", "какой"],
        "whatNames": ["ассортимент", "название", "каталог", "меню", "наличие"],
        "whatIngredients": ["состав", "ингридиенты", "каталог", "меню"],
        "whatSizes": ["размер", "диаметр", "объём"],
        "whatPrices": ["цена", "дорого", "дешево"],
    }
    
    dict.entities.yes = ["да", "давать", "хотеть", "согласный"]
    dict.entities.no = ["нет", "неа", "не", "отвалить", "отказываться"]
    
    dict.entities["ingredient"] = [];
    goods.forEach((g) => {
        g.ingredients.forEach((i) => {
            if (!dict.entities["ingredient"].includes(i)) {
                let lemma = literacy.getLemma(i);
                dict.entities["ingredient"].push(lemma.toLowerCase());
            }
        })
    });
    
    dict.entities["size"] = [];
    goods.forEach((g) => {
        for (let s in g.size) {
            if (!dict.entities["size"].includes(s)) {
                let lemma = literacy.getLemma(s);
                dict.entities["size"].push(lemma.toLowerCase());
            }
        }
    })
    
    dict.entities["name"] = [];
    goods.forEach((g) => {
        if (!dict.entities["name"].includes(g.name)) {
            // let lemma = literacy.getLemma(g.name);
            let lemma = g.name;
            dict.entities["name"].push(lemma.toLowerCase());
        }
    })
    
    dict.entities["taste"] = [];
    goods.forEach((g) => {
        g.taste.forEach((i) => {
            if (!dict.entities["taste"].includes(i)) {
                let lemma = literacy.getLemma(i);
                dict.entities["taste"].push(lemma.toLowerCase());
            }
        })
    })
    
    dict.numeralsMap = {
        1: ['первый', 'один'],
        2: ['второй', 'два'],
        3: ['третий', 'три'],
        4: ['четвертый', 'четыре'],
        5: ['пятый', 'пять'],
    }
    
    dict.entities["numerals"] = [];
    for (var number in dict.numeralsMap) {
        dict.numeralsMap[number].forEach((n) => {
            dict.entities["numerals"].push(number);
            if (!dict.entities["numerals"].includes(n)) {
                dict.entities["numerals"].push(n.toLowerCase());
            }
        })
    }

    dict.allWords = literacy.collectWords(dict);

    // RULES
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

    /* chatbot.addRule(new Rule(
        dict.entities.whatNames.concat(dict.entities.questions), // вопрос вне контекста
        null, // вопрос в контексте
        "Категории", // контекст
        null, //дефолтный ответ
        () => {
            chatbot.chooseAssortiment(this, "Хочешь пиццы?");
        }, //функция
        '' // id диалога
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
    )); */

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

    chatbot.addRule(new Rule(
        [], // вопрос вне контекста
        dict.entities.no, // вопрос в контексте
        "Подтверждение заказа", // контекст
        ['Не хочешь как хочешь. Попробуй другую?'], //дефолтный ответ
        () => {
            chatbot.clearPizzaMemory();
            chatbot.context = '';
        }, //функция
        null // id диалога
    ));


});





// bot

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
    //
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
            console.log("execute: " + foundInput);
            // console.log("cb - ", chatbot);
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
        chatbot.clearPizzaMemory();
        nextContext = nextContext || '';
        let response = '';
        let question = chatbot.question.split(' ');
        let memory = chatbot.memory.pizza;
        let name = chatbot.getEntity('name', question, true);
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
                response = `Вы выбрали пиццу <b>${memory.name}</b>. `;
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
            if (names.length != 0) {
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
        if (!memory.size && size) {
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
                response += `Мы выпекаем эту пиццу такого размера: <b>${sizes}.</b> `;
                response += `<br>Какой вам больше нравится?`;
                nextContext = "Уточнение размера";
            }
        } else {
            let chosenGoods = chatbot.filterGoodsByParam('пицца', 'name', memory.name);
            let firstName = Object.keys(chosenGoods)[0];
            let chosenGood = chosenGoods[firstName];
            memory.price = chosenGood.size[memory.size];
            response += `Пицца "<b>${memory.name}</b>"`;
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
        } else if (value) {
            vArray = value;
            for (let i = 0; i < vArray.length; i++) {
                vArray[i] = vArray[i].toLowerCase();
            }
        }
        if (vArray) {
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
        } else {
            result = false;
        }
        return result;
    },

    getGoodsParam: (category, name, param) => {
        category = category.toLowerCase();
        name = name.toLowerCase();
        name = literacy.getLemma(name);
        param = param.toLowerCase();
        let results;
        let gCategory, gName, gParam;
        goods.forEach((g) => {
            gCategory = g.category.toLowerCase();
            gName = g.name.toLowerCase();
            gName = literacy.getLemma(gName);
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
    getEntity: (entity, question, doNotLematize) => {
        let unexpected = new RegExp('пицца', 'ig');
        let questionLemmas = literacy.clearPrepositions(question);
        if (typeof(question) == 'string') {
            question = question.split(' ');
            questionLemmas = questionLemmas.split(' ');
        }
        let entities = chatbot.getAllEntities(entity);
        let results = [];
        if (entities) {
            for (let i = 0; i < questionLemmas.length; i++) {
                let q = questionLemmas[i];
                if (q.search(unexpected) == -1) {
                    entities.forEach((e) => {
                        let eLemma = literacy.getLemma(e);
                        let eArray = eLemma.split(' ');
                        if (eArray.includes(q)) {
                            if (doNotLematize) results.push(e);
                            else results.push(eLemma);
                        }
                    })
                }
                
            }
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



