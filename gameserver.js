var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');

var GameMaster = require('./lib/gamemaster').GameMaster;
var Parser = require('./lib/parser').Parser;
var User = require('./models/userModel');

// Connect to DB
mongoose.connect('mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
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
	user.socket = socket; // Need to find best way to do this but it works
	/* 
	 * SAS: Need to figure out way to push into gameMaster.users where there's
	 * a key that isn't just a number but a name, ie. gM.users['balzario'] pulls
	 * up Balzario's object (which we can then check socket id against for auth) 
	 *
	 */
	gameMaster.users.push(user);

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

gameserver.on('connection', function (socket) {
	var messageEmitter = new EventEmitter();
	
	var welcomeText = "//" + "\n";
	welcomeText = welcomeText + "//     Making Mud     " + "\n";
	welcomeText = welcomeText + "//  (c) SAS/AFS 2013 " + "\n";
	welcomeText = welcomeText + "//" + "\n" + "\n";
	welcomeText = welcomeText + "Please select the following:" + "\n";
	welcomeText = welcomeText + "1. Enter your name" + "\n";
	welcomeText = welcomeText + "2. Create new player" + "\n";
	var message = {
		type: 'welcome',
		content: welcomeText
	}
	socket.send(JSON.stringify(message));
	
	socket.on('message', function (data) {
		console.log('---------------');
		console.log('FROM THE SOCKET');
		console.log(data);
		data = JSON.parse(data);
		messageEmitter.emit(data.type, data.data);
	});
	
	messageEmitter.on('menu', function(data) {
		if (data === "1") {
			// switch to login
			var message = {
				"type": "menu",
				"success": true,
				"content": "Please enter your name:"
			};
			messageEmitter.emit('OUT', message);
		}
		if (data === "2") {
			// execute characterCreator()
		}
	});
	
	messageEmitter.on('login', function(data) {
		User.findOne({name: data}, function(err, user) {
			if (err) {
				return console.error(err);
			}
			if (!user) {
				console.log('User does not exist.');
				var message = {
					"type": "login",
					"content": "Name not found!"
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
		});
	});

	messageEmitter.on('password', function (data) {
		var password = "secret";
		if(password === data) {
			var message = {
				"type": "password",
				"success": true,
				"socket": socket.id,
				"content": "Log in successful!"
			};
			messageEmitter.emit('OUT', message);
			loadUser(messageEmitter, socket);
		} else {
			console.log('Password incorrect!');
			var message = {
				"type": "password",
				"content": "Please re-enter your password:"
			};
			messageEmitter.emit('OUT', message);
		}		
	});

	messageEmitter.on('say', function(data) {
		/* 
		 * SAS: Should consider adding 'say' into parser so only one place
		 * that reviews commands
		 *
		 */
		var user = messageEmitter.user;
		var message = {
			type: 'say',
			name: user.name,
			content: data
		};
		console.log(messageEmitter.room);
		gameMaster.getRoom(messageEmitter.room, function(err, room) {
			if (err) {
				return console.error(err);
			}
			if (!room) {
				return console.log('No room found.');
			}
			room.users.forEach(function(user) {
				user.socket.send(JSON.stringify(message));
			});
		});
	});
	
	messageEmitter.on('command', function(data) {
		if (!messageEmitter.user) {
			// User not logged in yet
			return;
		}
		/* 
		 * SAS: Here would check socket id sent from client to make sure matches
		 * with socket id of user stored in gM
		 *
		 */
		console.log(gameMaster.users);
		Parser.command(messageEmitter, data, gameMaster);
	});

	messageEmitter.on('OUT', function(data) {
		// console.log(data);
		socket.send(JSON.stringify(data));
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
	
});