var Room = require('../models/roomModel');

console.log('GameMaster launched by webserver...');

// Set up constructor for Game Master Function which will run the game
var GameMaster = function() {
	var self = this;
	self["rooms"] = {}; // this obj will hold room objects that are currently active in the game
	self["users"] = {}; // this obj will hold all users currently active in the game
}

// Checks if a room object is needed, if it's in the array it loads the object, otherwise it gets it from the DB=
GameMaster.prototype.getRoom = function(roomId, cb) {
	var self = this;
	if (self.rooms[roomId]) {
		return cb(null, self.rooms[roomId]);
	}
	Room.findOne({_id:roomId}, function(err, room) {
		if (err) {
			console.error(err);
			return cb(err);
		}
		if (!room) {
			return console.log('No room found by GameMaster.');		
		} else {
			self.rooms[room._id] = room;
			return cb(null, room);
		}
	});
}

GameMaster.prototype.userRoomAction = function(user, roomId, action) {
	var self = this;
	var room = self.rooms[roomId];
	if(action == 'add') {
		room.addUserToRoom(user);
		return;
	}
	room.removeUserFromRoom(user);
	return;
}

/* TODO: Figure out what algorithm is for removing a room from the gamemaster.rooms array */

exports.GameMaster = GameMaster;