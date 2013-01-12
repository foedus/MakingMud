var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');
var socket = new eio.Socket('ws://localhost:8083/');

commandInput.addEventListener('keypress', function(key) {
	if (key.keyCode !== 13) {
		return;
	}
	var command = {
		'type': 'command',
		'data': commandInput.value
	}
	socket.send(JSON.stringify(command));
	commandInput.value = '';
});

// Opens socket as a client connects to the game server
socket.on('open', function () {
	var userName = prompt('What is your name?');
	var command = {
		'type':'login',
		'userName':userName
	}
	socket.send(JSON.stringify(command));
		
	socket.on('message', function (data) {
		var command = JSON.parse(data);
		processCommand(command);
	});
});

function processCommand (command) {
	var newElement = document.createElement('div');
	if (command.type === 'room') {
		newElement.innerText = command.title;
	}
	contentDiv.appendChild(newElement);
};