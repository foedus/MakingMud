var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');
var socket = new eio.Socket('ws://localhost:8083/');

commandInput.addEventListener('keypress', function(key) {
	if (key.keyCode !== 13) {
		return;
	}
	socket.send(commandInput.value);
	commandInput.value = '';
});

// Opens socket as a client connects to the game server
socket.on('open', function () {
	socket.on('message', function (data) {
		var command = JSON.parse(data);
		processCommand(command);
	});
});

function processCommand (command) {
	var newElement = document.createElement('div');
	newElement.innerText = command;
	contentDiv.appendChild(newElement);
};


