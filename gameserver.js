var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');

var GameMaster = require('./lib/gamemaster').GameMaster;
var Parser = require('./lib/parser').Parser;
var roller = require('./lib/roller').roller;
var User = require('./models/userModel');

// Connect to DB
mongoose.connect('mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Mongoose connected!');
});

// Initializes GameMaster
var gameMaster = new GameMaster();

// Starts gameserver
var gameserver = engine.listen(8083, function() {
	console.log('Gameserver listening on port 8083...');
});

function loadUser (messageEmitter, socket) {
	/* LOAD */
	var user = messageEmitter.user;
	user.online = true;
	user.socket = socket;
	gameMaster.users[user.name] = user;

	if (!user.roomId) {
		user.roomId = '512150235e8fbbd616000002' // put new users in TSC by default
	}
			
	gameMaster.getRoom(user.roomId, function(err, room) {
		if (err) {
			return console.error(err);
		}
		if (!room) {
			return console.log('User did not have a room.');
		}
		user.roomId = room._id;
		user.save(function(err) {
			if (err) {
				return console.error(err);
			}
			// User is active, room is updated.
			/* Now we send the first room message: */
			var message = {
				name: user.name,
				type: 'room',
				title: room.title,
				description: room.description,
				exits: room.getExits(),
				who: room.getUsers(),
			};
			/*
			We could do this in a user.setRoom method.
			*/
			messageEmitter.emit('OUT', message);
			user.startUserLoop();
			messageEmitter.user = user;
			messageEmitter.room = room._id;
			gameMaster.userRoomAction(user, messageEmitter.room, 'add');
		});
	});	
}

gameserver.on('connection', function(socket) {
	var messageEmitter = new EventEmitter();
	
	// BEGIN SETUP OF COMMAND PARSING
	
	// Handles all outgoing messages from gameserver
	messageEmitter.on('OUT', function(data) {
		socket.send(JSON.stringify(data));
	});
	
	// initialize commandState at menu, then shift
	var commandState = "menu";
	
	messageEmitter.on('command', function(data) {
		if (commandState === "menu") {
			if (data.data === "1") {
				// switch to login
				var message = {
					"type": "menu",
					"content": "Please enter your name:"
				};
				messageEmitter.emit('OUT', message);
				return commandState = "login";
			}
			if (data.data === "2") {
				console.log('--SWITCHING TO ROLLER--');
				commandState = "roller";
				messageEmitter.removeListener('command', function(err) {
					if (!err) console.log('login listener removed by roller.');
				});
				return roller.newChar(messageEmitter, socket);
			}
		} else if (commandState === "login") {
			User.findOne({name: data.data}, function(err, user) {
				if (err) {
					return console.error(err);
				}
				if (!user) {
					console.log('User does not exist.');
					var message = {
						"type": "login",
						"content": "Name not found! Please try again."
					};
					return messageEmitter.emit('OUT', message);
				}
				// Tell the client that login succeeded
				console.log('User found, login success.');
				var message = {
					"type": "login",
					"success": true,
					"name": user.name,
					"content": "Please enter your password:"
				}
				messageEmitter.user = user;
				messageEmitter.emit('OUT', message);
				return commandState = "password";
			});
		} else if (commandState === "password") {
			var password = "";
			if (password === data.data) {
				var message = {
					"type": "password",
					"success": true,
					"socket": socket.id,
					"content": "Log in successful!"
				};
				messageEmitter.emit('OUT', message);
				commandState = "command";
				loadUser(messageEmitter, socket);
			} else {
				console.log('Password incorrect!');
				var message = {
					"type": "password",
					"content": "Incorrect. Please re-enter your password:"					
				};
				messageEmitter.emit('OUT', message);
			}		
		} else if (commandState === "command") {
			// Handles all post-login commands via parser
			if (!messageEmitter.user) {
				// User not logged in yet
				return;
			}
			// Authenticates entry
			var user = messageEmitter.user;
			if (data.userSocket != gameMaster['users'][user.name]['socket']['id']) {
				// Do we need to unset user from gameMaster, stop heartbeat, etc.?
				message = {
					type: 'authError',
					content: '**user not authenticated**'
				};
				return messageEmitter.emit('OUT', message);
			}
			
			Parser.command(messageEmitter, data.data, gameMaster);
		}
	});
	
	// Handle incoming messages from the client
	socket.on('message', function(data) {
		console.log('---------------');
		console.log('FROM THE SOCKET');
		console.log(data);
		data = JSON.parse(data);
		messageEmitter.emit(data.type, data);
	});
	
	// Upon close of client window, run appropriate logout tasks
	socket.on('close', function () {
		var user = messageEmitter.user;
		clearInterval(user.intId);
		// Takes user out of gameMaster
		gameMaster.users.splice(gameMaster.users.indexOf(user), 1);
		// Takes user out of room in gameMaster
		gameMaster.userRoomAction(user, messageEmitter.room, 'remove');
		// Sets user online flag to 'false' so db also knows user no longer playing
		user.online = false;
		user.save(function (err) {
			if (err) {
				return console.error(err);
			}		
		});
		console.log(gameMaster);		
	});
	
	// END SETUP OF COMMAND PARSING
	
	// Send user a welcome message and launch game
	var welcomeText = "//" + "\n";
	welcomeText = welcomeText + "//     Making Mud     " + "\n";
	welcomeText = welcomeText + "//  (c) SAS/AFS 2013 " + "\n";
	welcomeText = welcomeText + "//" + "\n" + "\n";
	welcomeText = welcomeText + "Please select the following:" + "\n";
	welcomeText = welcomeText + "1. Existing character" + "\n";
	welcomeText = welcomeText + "2. Create new character" + "\n";
	var message = {
		"type": "welcome",
		"content": welcomeText
	}
	messageEmitter.emit('OUT', message);
});

exports.loadUser = loadUser;