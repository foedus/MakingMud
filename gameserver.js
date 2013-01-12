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
		if (data.type === 'login') {
			var user = new UserTools.User(data.userName);
			user.getUser(user.userName, function (err,user) {
				var room = new RoomTools.Room(user.roomId);
				room.getRoom(room._id, function (err,room) {
					var message = {
						type: 'room',
						title: room.title,
						description: room.description
					}
					socket.send(JSON.stringify(message));
				});
			});
		} else if (data.type == 'command') {	
			if (/^say .*/.test(data.data)) {
				var message = {
					type: 'say',
					content: data
				}
			socket.send(JSON.stringify(data));
			}
		}
	});
});

