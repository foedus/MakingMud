var engine = require('engine.io');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var RoomTools = require('./lib/room');
var UserTools = require('./lib/user');

var gameserver = engine.listen(8083, function() {
	console.log('Gameserver listening on port 8083...');
});

gameserver.on('connection', function (socket) {
	socket.on('message', function (data) {
		data = JSON.parse(data);
		switch (data.type) {
			case 'login':
				var player = new UserTools.User(data.userName);
				player.getUser(player.userName, function (err, user) {
					socket.player = player;
					var location = new RoomTools.Room(user.roomId);
					location.getRoom(location._id, function (err, room) {
						var message = {
							type: 'room',
							title: room.title,
							description: room.description
						}
						socket.location = location;
						socket.send(JSON.stringify(message));
					});
				});
				break;	
			case 'command':
				if (data.data === 'north' || data.data === 'south') {
					var direction = data.data;
					var location = socket.location;
					var player = socket.player;
					location.checkExits(direction, function(err, test) {
						if (test) {
							var newRoomId = location[direction];
							player.setRoom(newRoomId, function (err,junk) {
								console.log(location._id);
								location.getRoom(newRoomId, function (err, room) {
									socket.location = location;
									var message = {
										type: 'room',
										title: room.title,
										description: room.description
									}
									socket.send(JSON.stringify(message));
								});
							});
						}
					});	
				}
				if (/^say .*/.test(data.data)) {
					var message = {
						type: 'say',
						content: data
					}
				socket.send(JSON.stringify(data));
				}
				break;	
			default:
				console.log(data);
				var message = {
					type: 'error',
					content: 'Message not recongnized'
				}
				socket.send(JSON.stringify(data));
				break;	
		}
	});
});