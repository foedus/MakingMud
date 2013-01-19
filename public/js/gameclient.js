var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');
var socket = new eio.Socket('ws://localhost:8083/');

commandInput.focus();

commandInput.addEventListener('keypress', function(key) {
	if (key.keyCode !== 13) {
		return;
	}
	if (/^'.*/.test(commandInput.value)) {
		var command = {
			'type': 'say',
			'data': commandInput.value.slice(1)
		}
	} else {
		var command = {
			'type': 'command',
			'data': commandInput.value
		}
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
		// Can attach username to command - i.e. command.user = userName
		processCommand(command);
	});
});

function processCommand (command) {
	var newElement = document.createElement('div');
	if (command.type === 'room') {
		newElement.innerText = command.title + "\n" + command.description + "\n" + ">";
	}
	if (command.type === 'say') {
		// Need to add that if the person saying something is you, it says "you say"...
		newElement.innerText = command.name + ': ' + command.content + "\n" + ">";
	}
	if (command.type === 'error') {
		// Need to add that if the person saying something is you, it says "you say"...
		newElement.innerText = command.content + "\n" + ">";
	}
	contentDiv.appendChild(newElement);
};