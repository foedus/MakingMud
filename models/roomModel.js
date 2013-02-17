var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
	title: String,
	description: String,
	exits: {
		north: String,
		south: String,
		east: String,
		west: String,
		northeast: String,
		northwest: String,
		southeast: String,
		southwest: String,
		up: String,
		down: String,
		other: Array
	},
	users: Array
});

/* Following two functions are to demonstrate who is in room and online;
   The db stores the last room the person was in for persistance purposes */

roomSchema.methods.addUserToRoom = function(user) {
	var self = this;
	self.users.push(user);
	var message = {
		type: 'arrival',
		name: user.name,
		content: user.name + ' enters the room.'
	};
	self.users.forEach(function(user) {
		user.socket.send(JSON.stringify(message));
	});
};

roomSchema.methods.removeUserFromRoom = function(user) {
	var self = this;
	self.users.splice(self.users.indexOf(user),1);
	var message = {
		type: 'departure',
		name: user.name,
		content: user.name + ' leaves the room.'
	};
	self.users.forEach(function(user) {
		user.socket.send(JSON.stringify(message));
	});
};

roomSchema.methods.checkExits = function(direction) {
	var self = this;
	return self.exits[direction];
};

roomSchema.methods.getRoomName = function(cb) {
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

roomSchema.methods.getExits = function() {
	var self = this.toObject();
	var exits = [];
	var exitString = '';
	for (var i in self.exits) {
		if (i !== 'other') {
			exits.push(i);
		}
	}
	exitString = exits.join(', ');
	if (exitString.length == 0) {
		exitString += 'none.';
	} else {
		exitString += '.';
	}
	return exitString;
}

roomSchema.methods.getUsers = function() {
	var self = this;
	var userString = '';
	var len = self.users.length;
	if (len == 0) {
		return userString = 'you.';
	}
	for (i=0; i<len; i++) {
		if (i != len-1) {
			userString += self.users[i].name + ', ';
		} else {
			userString += self.users[i].name + ' and you.'
		}
	}
	return userString;
}

module.exports = mongoose.model('Room', roomSchema);