var commandInput = document.querySelector('#input > input');
var contentDiv = document.querySelector('#content');
var socket = new eio.Socket(window.location.hostname);

var newElement = document.createElement('div');
contentDiv.appendChild(newElement);	

commandInput.focus();
	
function commandHandler (key) {
	// Checks to see if return key has been pressed
	if (key.keyCode !== 13) {
		return;
	}
	// Forces scroll to bottom of div since user just entered text
	contentDiv.scrollTop = contentDiv.scrollHeight;
	
	var command = {
		'type': 'command',
		'data': commandInput.value
	}
	
	// SAS: Adds socket to command sent to server for authentication checking
	if(socket.id) {
		command.userSocket = socket.id;
	}
	socket.send(JSON.stringify(command));
	commandInput.value = '';
}

// Opens socket as a client connects to the game server
socket.on('open', function () {
	commandInput.addEventListener('keypress', commandHandler);	
	socket.on('message', function (data) {
		var command = JSON.parse(data);
		// Can attach username to command - i.e. command.user = userName 
		// so that you can detect who is saying it and put 'you' instead
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
	
	if (command.type === 'welcome') {
		console.log('WELCOME command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'menu') {
		console.log('MENU command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'roller') {
		console.log('ROLLER command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'login') {
		console.log('LOGIN command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'password') {
		console.log('PASSWORD command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'room') {
		console.log('ROOM command received in client.');
		newElement.innerText = '[' + command.title + ']' + "\n" + command.description + "\n" + 'exits: ' + command.exits + "\n" + 'who: ' + command.who;
	}
	
	if (command.type === 'say') {
		// NEED TO ADD WAY TO GET NAME FROM GAMESERVER
		var name = "";
		console.log('SAY command received in client.');
		if (command.name == name) {
			newElement.innerText = 'You say, "' + command.content + '"';
		} else {
			newElement.innerText = command.name + ' says, "' + command.content + '"';
		}
	}
	
	if (command.type === 'error') {
		console.log('ERROR command received in client.');
		newElement.innerText = command.content;
	}
	
	if (command.type === 'authError') {
		console.log('AUTHERROR command received in client.');
		// Do we reset logged in, etc., ie. act as logout?
		newElement.innerText = command.content;
	}
	
	if (command.type === 'logout') {
		console.log('LOGOUT command received in client.');
		loggedIn = false;
		name = "";
		contentDiv.innerHTML = '';
		newElement.innerText = command.content;
		newElement.innerText = newElement.innerText + "\n" + "Refresh your browser to login again."
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
	
	if (command.type === 'combat') {
		newElement.innerText = command.content;
	}
		
	newElement.innerText = newElement.innerText + '\n' + '>';
	contentDiv.appendChild(newElement);
	
	bottomScroll();
};

function bottomScroll () {
	// in theory, when you are near the bottom, content will autoScroll, when you are scrolled up it won't
	if ((contentDiv.scrollHeight - contentDiv.scrollTop - contentDiv.clientHeight) < 300) {
		contentDiv.scrollTop = contentDiv.scrollHeight;
	}
}