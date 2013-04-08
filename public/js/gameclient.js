var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');
var socket = new eio.Socket('ws://localhost:8083/');

var newElement = document.createElement('div');
newElement.innerText = newElement.innerText + "//" + "\n";
newElement.innerText = newElement.innerText + "//     Making Mud     " + "\n";
newElement.innerText = newElement.innerText + "//  (c) SAS/AFS 2013 " + "\n";
newElement.innerText = newElement.innerText + "//" + "\n" + "\n";
newElement.innerText = newElement.innerText + "Welcome! Please enter your character's name below." + "\n";
newElement.innerText = newElement.innerText + ">" + "\n";
contentDiv.appendChild(newElement);	

var name;

commandInput.focus();

function loginHandler (key) {
	if (key.keyCode !== 13) {
		return;
	}
	contentDiv.scrollTop = contentDiv.scrollHeight;
	var command = {
		'type': 'login',
		'data': commandInput.value
	}
	socket.send(JSON.stringify(command));
	commandInput.value = '';
}
	
function commandHandler (key) {
	// Checks to see if return key has been pressed
	if (key.keyCode !== 13) {
		return;
	}
	// Forces scroll to bottom of div since user just entered text
	contentDiv.scrollTop = contentDiv.scrollHeight;
	// Sends data input to gameserver
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
}

// Opens socket as a client connects to the game server
socket.on('open', function () {
	commandInput.addEventListener('keypress', loginHandler);	
	socket.on('message', function (data) {
		var command = JSON.parse(data);
		// Can attach username to command - i.e. command.user = userName so that you can detect who is saying it and put 'you' instead
		processCommand(command);
	});
});

// // Runs appropriate actions once user logs out of game
// socket.on('close', function() {
// 	var command = {
// 		'type':'logout'
// 	}
// 	socket.send(JSON.stringify(command));
// });

function processCommand (command) {
	var newElement = document.createElement('div');
	if (command.type === 'room') {
		newElement.innerText = '[' + command.title + ']' + "\n" + command.description + "\n" + 'exits: ' + command.exits + "\n" + 'who: ' + command.who;
	}
	if (command.type === 'say') {
		if (command.name == name) {
			newElement.innerText = 'You say, "' + command.content + '"';
		} else {
			newElement.innerText = command.name + ' says, "' + command.content + '"';
		}
	}
	if (command.type === 'error') {
		newElement.innerText = command.content;
	}
	if (command.type === 'login') {
		if (command.success) {
			commandInput.removeEventListener('keypress', loginHandler);
			commandInput.addEventListener('keypress', commandHandler);
			name = command.name;
			newElement.innerText = command.content;
		} else {
			newElement.innerText = command.content;
		}
	}
	if (command.type === 'interval') {
		newElement.innerText = command.content;
	}
	if (command.type === 'arrival') {
		if(command.name == name) return;
		newElement.innerText = command.content;
	}
	if (command.type === 'departure') {
		if(command.name == name) return;
		newElement.innerText = command.content;
	}
	newElement.innerText = newElement.innerText + '\n' + '>';
	contentDiv.appendChild(newElement);
	// Forces game client window to scroll to bottom of page when you are at the bottom of the page
	if ((contentDiv.scrollHeight - contentDiv.scrollTop - contentDiv.clientHeight) < 100) {
		contentDiv.scrollTop = contentDiv.scrollHeight;
	}
};