var RoomModel = require('../models/roomModel');

var Room = function(id) {
	var self = this;
	self._id = id;
	self.users = [];
}

Room.prototype.loadRoomInfo = function(rid, cb) {
	var self = this;
	RoomModel.findOne({_id:rid}, function(err, roomData) {
		if (err) {
			return console.error(err);
		}
		if (!roomData) {
			return console.log('No room.');
		}
		self.title = roomData.title;
		self.description = roomData.description;
		self.exits = roomData.exits;
		return cb(null);
	});
};

/* Following two functions are to demonstrate who is in room and online;
   The db stores the last room the person was in for persistance purposes */

Room.prototype.addUserToRoom = function(user) {
	var self = this;
	self.users.push(user);
};

Room.prototype.removeUserFromRoom = function(user) {
	var self = this;
	self.users.splice(self.users.indexOf(user),1);
};

/* End of adding / removing people from room */

Room.prototype.checkExits = function(direction) {
	var self = this;
	return self.exits[direction];
};

Room.prototype.getRoomName = function(cb) {
	var self = this;
	RoomModel.findOne({_id:self._id}, function(err, roomData) {
		if (err) {
			return console.error(err);
		}
		if (!roomData) {
			return console.log('Room not found.');
		}
		return cb(null, roomData.title);
	});
}

// Room.prototype.say = function (who, what) {
// 	lgth = what.length;
// 	this.onlineUsers.forEach(function (user) {
// 		var message = {
// 			type: 'say',
// 			who: who,
// 			content: what.substr(4,lgth)
// 		}
// 		user.socket.send(JSON.stringify(message));
// 	});
// };

exports.Room = Room;