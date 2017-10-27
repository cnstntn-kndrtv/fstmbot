var chatList = document.getElementById('chatList'),
    chatMessages = document.getElementById('chatMessages'),
    inputField = document.getElementById('chatInput'),
    userField = document.getElementById('userName'),
    socket = io(),
    botMessage;

inputField.focus();

function submitEnter(){ 
    var keycode;
    keycode = window.event.keyCode;
    if (keycode == 13) { 
        sendMessage(inputField.value);
    } 
}

function sendMessage(chatInput){
    if(chatInput == null){
        var chatInput = inputField.value;
    }
    if(chatInput == ''){
        return;
    }
    var myMessage = document.createElement('li');
    myMessage.className = 'chat-message from-bot';
    //myMessage.appendChild(document.createTextNode(chatInput)); // выводит то, что ввел пользователь
    myMessage.innerHTML = '<a onclick="sendMessage(this.innerText)" style="cursor: pointer">' + chatInput + '</a>'; // чтобы сообщения повторять
    chatList.appendChild(myMessage);
    scrollChatMesagesWindow();
    lockInputField("Я думаю...");
    recieveMessage(chatInput); // получает ответ на Очищенный запрос
}

function recieveMessage(question){
    var botAnswer = '';
    socket.emit('user message', userField.value.trim(), question);
}

socket.on('bot message', function(msgObj){
    botAnswer = msgObj.text;
    botMessage = document.createElement('li');
    botMessage.className = 'chat-message from-user';
    botMessage.innerHTML = botAnswer;
    chatList.appendChild(botMessage);
    scrollChatMesagesWindow();
    unLockInputField();
    inputField.focus();
});

socket.on('set default user', function(user) {
    userField.value = user;
});

socket.on('connecting', function () {
    lockInputField("Соединение установливается");
});
 
socket.on('connect', function () {
    lockInputField("Соединение установлено");
});

socket.on('reconnect', function () {
    lockInputField("Соединение восстановлено");
});

socket.on('error', function () {
    lockInputField("Ошибка!");
});

socket.on('disconnect', function () {
    lockInputField("Соединение разорвано");
});



function scrollChatMesagesWindow(){
    for (i = 0, s = 0 ; i < chatList.children.length; i++){
        s += chatList.children[i].clientHeight +100000;
    }
    if (s > chatList.offsetHeight){
        chatMessages.scrollTop = s;
    }
}

function lockInputField(msg){
    inputField.disabled = true
    inputField.className = inputField.className + ' chat-input-lock'
    inputField.value = ""
    inputField.placeholder = msg;
}

function unLockInputField(){
    inputField.disabled = false
    inputField.className = 'chat-input'
    inputField.placeholder = "Ваше сообщение ..."
}
