var engine = require('engine.io');
var RoomTools = require('./lib/room');
var UserTools = require('./lib/user');
var EventEmitter = require('events').EventEmitter;

function GameMaster() {
	var self = this;
	self.rooms = {};
};

GameMaster.prototype.getRoom = function(roomId, cb) {
	var self = this;
	if (self.rooms[roomId]) {
		return cb(null, self.rooms[roomId]);
	}
	Room.find({_id:roomId}, function(err, room) {
		if (err) {
			return cb(err);
		}
		if (!room) {
			return;
		}
		self.rooms[roomId] = room;
		return cb(null, room);
	});
}

var gameMaster = new GameMaster();

var gameserver = engine.listen(8083, function() {
	console.log('Gameserver listening on port 8083...');
});

gameserver.on('connection', function (socket) {
	var messageEmitter = new EventEmitter();
	socket.on('message', function (data) {
		data = JSON.parse(data);
		messageEmitter.emit(data.type, data.data);
	});
	
	messageEmitter.on('login', function(data) {
		User.find({userName:data}, function(err,user) {
			if (err) {
				console.error(err);
				return;
			}
			if (!user) {
				return;
			}
			user.online = true;
			user.save(function(err) {
				if (err) {
					console.error(err);
					return;
				}
				// User is active
				gameMaster.getRoom(user.roomId, function(err,room) {
					if (err) {
						console.error(err);
						return;
					}
					if (!room) {
						return;
					}	
					user.room = room; 
					/* Now we send the first room message: */
					var message = {
						type: 'room',
						title: room.title,
						description: room.description
					} 
					/*
					We could do this in a user.setRoom method.
					*/
					messageEmitter.emit('OUT', message);
					messageEmitter.user = user;
				});
			});
		});
		
	});
	messageEmitter.on('command', function(data) {
		if (!messageEmitter.user) {
			// User not logged in yet
			return;
		}
		var dirArray = ['north','south','east','west','northeast','southeast','northwest','southwest','up','down'];
		var combatArray = ['attack','dodge'];
		var newArray = [
		{
			'triggers': dirArray,
			'action': function() {
				// Code for what to do on dirArray class triggers
			};
		},
		{
			'triggers': combatArray,
			'action': function() {
				// Code for what to do on combatArray class triggers
			};
		}
		];
		newArray.forEach(function (action) {
			if (action.triggers.indexOf(data) == -1) {
				return;
			}
			action.action(data);
		})
		
		if (dirArray.indexOf(data) == -1) {
			return;
		}
		var direction = data;
		var room = user.room;
		
		if(!room.checkExits(direction)) {
			// Send back error message
			message = {
				type: 'error',
				content: 'Sorry, you cannot move in that direction.'
			};
			return;
		}
		var newRoomId = room[direction];
		gameMaster.getRoom(newRoomId, function(err, room) {
			if (err) {
				console.error(err);
				return;
			}
			if (!room) {
				return;
			}
			user.roomId = newRoomId;
			user.room = room;
			user.save(function(err) {
				if (err) {
					console.error(err);
					return;
				}
				var message = {
					type: 'room',
					title: room.title,
					description: room.description
				};
				messageEmitter.emit('OUT', message);
			});
		});
		
	});
	messageEmitter.on('logout', function(data) {
		// Turn off online flag here.	
	});
	messageEmitter.on('OUT', function(data) {
		console.log(data);
		socket.send(JSON.stringify(data));
	});
});

			// case 'say': 
			// 	var content = data.data.slice(1);
			// 	var message = {
			// 		type: 'say',
			// 		name: socket.player.userName,
			// 		content: content
			// 	};
			// 	socket.send(JSON.stringify(message));
			// 	break;	