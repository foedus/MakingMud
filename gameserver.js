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

gameserver.on('connection', function (socket) {
	var messageEmitter = new EventEmitter();
	
	var welcomeText = "//" + "\n";
	welcomeText = welcomeText + "//     Making Mud     " + "\n";
	welcomeText = welcomeText + "//  (c) SAS/AFS 2013 " + "\n";
	welcomeText = welcomeText + "//" + "\n" + "\n";
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
	
	messageEmitter.on('login', function(data) {
		User.findOne({name: data}, function(err, user) {
			if (err) {
				return console.error(err);
			}
			if (!user) {
				console.log('User does not exist.');
				var message = {
					"type": "login",
					"content": "Please try again!"
				}
				return messageEmitter.emit('OUT', message);
			}
			
			user.online = true;
			user.socket = socket; // Need to find best way to do this but it works
			gameMaster.users.push(user);
			
			// Tell the client that login succeeded
			console.log('User found, login success.');
			var message = {
				"type": "login",
				"success": true,
				"name": user.name,
				"content": "Please enter your password:"
			}
			messageEmitter.emit('OUT', message);
			
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
						type: 'room',
						title: room.title,
						description: room.description,
						exits: room.getExits(),
						who: room.getUsers()
					} 
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
		});	
	});

	messageEmitter.on('say', function(data) {
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