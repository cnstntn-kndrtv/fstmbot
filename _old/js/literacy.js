// Проверка грамотности
// Az.Morph.init('./node_modules/az/dicts', function() {
//     var parses = Az.Morph('стали');
//     console.log(parses); // => 6 вариантов разбора
//     console.log(parses[0].tag.toString()); // => 'VERB,perf,intr plur,past,indc'
//     console.log(parses[1].tag.toString()); // => 'NOUN,inan,femn plur,nomn'
// });

function Literacy() {
}

Literacy.prototype = {
    
    check: function(string){
        var question = string.trim(); // удаляем лишние пробелы
        question = question.toLowerCase() // в нижний регистр
        question = literacy.deletePunctuations(question); // удаляем знаки препинания
        var questionArray = question.split(" "); // разбиваем Вопрос на массив
        // TODO к каждому слову - поиск опечаток
        // questionArray = literacy.retainWords(dict.allWords, questionArray); // оставляем в Вопросе только слова, которые есть словаре
        // TODO удалить дубликаты слов
        // questionArray = literacy.normalizeWords(dict, questionArray) // нормализуем слова (первое слово в кажом массиве словаря)
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
}

literacy = new Literacy();

dict.allWords = literacy.collectWords(dict);