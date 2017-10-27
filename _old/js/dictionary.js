var dict = {};

dict.nutrition = ["калорий", "калориность", "белка", "белков", "белок", "углеводов", "углеводы", "жиры", "жиров", "жира"]

dict.entities = {
    "category": ["пицца", "десерт", "напиток"],
    "questions": ["что есть", "у вас", "какой"],
    "whatNames": ["ассортимент", "название", "каталог", "меню", "наличие"],
    "whatIngredients": ["состав", "ингридиенты", "каталог", "меню"],
    "whatSizes": ["размер", "диаметр", "объём"],
    "whatPrices": ["цена", "дорого", "дешево"],
}

dict.entities.yes = ["да", "давай", "хочу", "согласен"]
dict.entities.no = ["нет", "неа", "не"]

dict.entities["ingredient"] = [];
goods.forEach((g) => {
    g.ingredients.forEach((i) => {
        if (!dict.entities["ingredient"].includes(i)) {
            dict.entities["ingredient"].push(i.toLowerCase());
        }
        // let words = i.split(' ');
        // words.forEach((w) => {
        //     if (!dict.entities["ingredient"].includes(w)) {
        //         dict.entities["ingredient"].push(w.toLowerCase());
        //     }
        // })
    })
});

dict.entities["size"] = [];
goods.forEach((g) => {
    for (var s in g.size) {
        if (!dict.entities["size"].includes(s)) {
            dict.entities["size"].push(s.toLowerCase());
        }
        // let words = s.split(' ');
        // words.forEach((w) => {
        //     if (!dict.entities["size"].includes(w)) {
        //         dict.entities["size"].push(w.toLowerCase());
        //     }
        // })
    }
})

dict.entities["name"] = [];
goods.forEach((g) => {
    if (!dict.entities["name"].includes(g.name)) {
        dict.entities["name"].push(g.name.toLowerCase());
    }
    // let words = g.name.split(' ');
    // words.forEach((w) => {
    //     if (!dict.entities["name"].includes(w)) {
    //         dict.entities["name"].push(w.toLowerCase());
    //     }
    // })
})

dict.entities["taste"] = [];
goods.forEach((g) => {
    g.taste.forEach((i) => {
        if (!dict.entities["taste"].includes(i)) {
            dict.entities["taste"].push(i.toLowerCase());
        }
        // let words = i.split(' ');
        // words.forEach((w) => {
        //     if (!dict.entities["taste"].includes(w)) {
        //         dict.entities["taste"].push(w.toLowerCase());
        //     }
        // })
    })
})

dict.numeralsMap = {
    1: ['первый', 'один'],
    2: ['второй', 'два'],
    3: ['третий', 'три'],
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