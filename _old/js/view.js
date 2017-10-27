document.body.style.overflow = "hidden" // lock scroll

chatList = document.getElementById('chatList')
chatMessages = document.getElementById('chatMessages')
inputField = document.getElementById('chatInput')

inputField.focus()

var logList = document.getElementById('logList')
var logWindow = document.getElementById('logWindow')

function showLog(state){
    var logItem = document.createElement('li')
    var logItemText = document.createElement('div')
    logItemText.innerHTML= state + ' context - ' + chatbot.context + '<br> question - ' + chatbot.question
    logItem.appendChild(logItemText)
    logList.insertBefore(logItem, logList.firstChild);
    //if(state == "A:") console.log("--- ", chatbot)
}

function sendFromButton(btn){
    var text = btn.innerText
    sendMessage(text)
}

function submitEnter(){ 
    var keycode;
    keycode = window.event.keyCode
    if (keycode == 13) { 
        sendMessage(document.getElementById('chatInput').value)
    } 
}

function sendMessage(chatInput){
    if(chatInput == null){
        var chatInput = document.getElementById('chatInput').value
    }
    if(chatInput == ''){
        return
    }
    var question = literacy.check(chatInput) // чистка запроса пользователя
    var myMessage = document.createElement('li')
    myMessage.className = 'chat-message from-me'
    myMessage.appendChild(document.createTextNode(chatInput)) // выводит то, что ввел пользователь
    chatList.appendChild(myMessage)
    scrollChatMesagesWindow()
    lockInputField()
    recieveMessage(question) // получает ответ на Очищенный запрос
    showLog("Q:")
}

function recieveMessage(question){
    var botAnswer = chatbot.answer(question);
    var botMessage = document.createElement('li');
    botMessage.className = 'chat-message from-them'
    botMessage.innerHTML = botAnswer
    chatList.appendChild(botMessage)
    scrollChatMesagesWindow()
    unLockInputField()
    inputField.focus()
    showLog("A:")
}

function showBotMessage(message){
    var botMessage = document.createElement('li')
    botMessage.className = 'chat-message from-them'
    botMessage.innerHTML = message
    chatList.appendChild(botMessage)
    scrollChatMesagesWindow()
    unLockInputField()
    inputField.focus()
    showLog("A:")
}

function scrollChatMesagesWindow(){
    for (i = 0, s = 0 ; i < chatList.children.length; i++){
        s += chatList.children[i].clientHeight +100000
    }
    if (s > chatList.offsetHeight){
        chatMessages.scrollTop = s
        
    }
}

function lockInputField(){
    inputField.disabled = true
    inputField.className = inputField.className + ' chat-input-lock'
    inputField.value = ""
    inputField.placeholder = "Я думаю ..."
}

function unLockInputField(){
    inputField.disabled = false
    inputField.className = 'chat-input'
    inputField.placeholder = "Ваше сообщение ..."
}

function showFullCard(smallCard){
    var productId = smallCard.id.replace(/^.*:/, '')
    for(i = 0; i < goods.length; i++){
        if (goods[i]['id'] == productId){
            var product = goods[i]
        }
    }
    if(product.comments == undefined){
        product.commentsLength = 0;
    }
    else{
        product.commentsLength = product.comments.length;
    }
    var ratingText ='ok';
    switch (Math.round(product.rating)){
        case 1:
            ratingPicture = "img/rate1.png"
            ratingText = 'плохо'
            break
        case 2:
            ratingPicture = "img/rate2.png"
            ratingText = 'плохо'
            break
        case 3:
            ratingPicture = "img/rate3.png"
            ratingText = 'средне'
            break
        case 4:
            ratingPicture = "img/rate4.png"
            ratingText = 'хорошо'
            break
        case 5:
            ratingPicture = "img/rate5.png"
            ratingText = 'отлично'
            break
        default:
            ratingPicture = "img/rate0.png"
            ratingText = 'нет оценок'
    }
    productCardFull.innerHTML = '<div class="navbar grey-interface-color-background dark-interface-color-text"><a onclick="hideFullCard()"><img src="img/button-back.png" class="button-back"></a><div class="navbar-header">Информация о товаре</div></div><div class="product-card-full-info dark-interface-color-text" id="productCardFullInfo"><div class="main-info-block"><div class="image-cell"><img src="' + product.picture + '" class="product-img"></div><div class="name-cell"><div class="product-name">' + product.name + '</div><div class="price light-branded-color-background dark-interface-color-text">' + product.price + ' руб.</div></div></div><div class="rate"><div class="rating"><img src="' + ratingPicture + '"><div class="value">' + product.rating + '</div><div class="value-text">' + ratingText + '</div></div><div class="comments"><img src="img/comments.png"><div class="value">' + product.commentsLength + '</div><div class="value-text">отзывы</div><a class="button-all-comments" id="buttonAllComments"><img src="img/button-forward.png"></a></div></div><div class="nutrition"><div class="header">Энергетическая ценность в 100гр.</div><div class="wrapper"><div class="callories with-border"><div class="value">' + product.callories + '</div><div class="value-text">Ккал</div></div><div class="callories with-border"><div class="value">' + product.protein + '</div><div class="value-text">Белки</div></div><div class="callories with-border"><div class="value">' + product.fat + '</div><div class="value-text">Жиры</div></div><div class="callories"><div class="value">' + product.carbs + '</div><div class="value-text">Углеводы</div></div></div></div><div class="description"><div class="header">Описание</div><div>' + product.description + '</div></div></div>';
    buttonAllComments.style.visibility = 'hidden';
    productCardFull.style.visibility = 'visible';
}






function hideFullCard(){
    productCardFull.style.visibility = 'hidden'
}