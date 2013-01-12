var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');

function processCommand (command) {
	var newElement = document.createElement('div');
	newElement.innerText = command;
	contentDiv.appendChild(newElement);
};

var socket = new eio.Socket('ws://localhost:8083/');
socket.on('open', function () {
	console.log('Socket opened.');	
	
	socket.on('message', function (data) {
		console.log('Command received');
		var command = JSON.parse(data);
		processCommand(command);
	});
});

commandInput.addEventListener('keypress', function(key) {
	if (key.keyCode !== 13) {
		return;
	}
	socket.send(commandInput.value);
	commandInput.value = '';
});