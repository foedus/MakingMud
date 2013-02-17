var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');

var GameMaster = require('./lib/gamemaster').GameMaster;
var User = require('./models/userModel');
var Room = require('./models/roomModel'); // Bring in Room and User models for use by functions

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
			user.online = true;
			user.socket = socket; // Need to find best way to do this but it works
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
		var user = messageEmitter.user;

		var dirArray = ['north','south','east','west','northeast','southeast','northwest','southwest','up','down'];

		// var mapArray = [
		// 		{
		// 			'triggers': dirArray,
		// 			'action': function() {
		// 				// Code for what to do on dirArray class triggers
		// 			};
		// 		},
		// 		{
		// 			'triggers': combatArray,
		// 			'action': function() {
		// 				// Code for what to do on combatArray class triggers
		// 			};
		// 		}
		// 		];
		
		// newArray.forEach(function (action) {
		// 	if (action.triggers.indexOf(data) == -1) {
		// 		return;
		// 	}
		// 	action.action(data);
		// })
		
		// This will be depricated once we have a catch all for commands that don't exist
		if (dirArray.indexOf(data) == -1) {
			return console.log('Direction not found.');
		}

		var direction = data;
		var room = gameMaster.rooms[messageEmitter.room];
		
		if(!room.checkExits(direction)) {
			// Send back error message
			message = {
				type: 'error',
				content: 'Sorry, you cannot move in that direction.'
			};
			return messageEmitter.emit('OUT', message);
		}
		
		var newRoomId = room.exits[direction];
		gameMaster.getRoom(newRoomId, function(err, room) {
			if (err) {
				console.error(err);
				return;
			}
			if (!room) {
				return;
			}
			gameMaster.userRoomAction(user, messageEmitter.room, 'remove');
			user.roomId = newRoomId;
			user.save(function(err) {
				if (err) {
					return console.error(err);
				}
				var message = {
					type: 'room',
					title: room.title,
					description: room.description,
					exits: room.getExits(),
					who: room.getUsers()
				};
				messageEmitter.room = room._id;
				gameMaster.userRoomAction(user, messageEmitter.room, 'add');
				messageEmitter.user = user;
				messageEmitter.emit('OUT', message);
			});
		});
	});

	messageEmitter.on('OUT', function(data) {
		// console.log(data);
		socket.send(JSON.stringify(data));
	});
	
	// // For when user logs themselves out
	// messageEmitter.on('logout', function(data) {
	// 	var user = messageEmitter.user;
	// 	user.online = false;
	// 	user.save(function (err) {
	// 		if (err) {
	// 			return console.error(err);
	// 		}
	// 		socket.close();
	// 	});		
	// });
	
	// Upon close of client window, run appropriate logout tasks
	socket.on('close', function () {
		var user = messageEmitter.user;
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