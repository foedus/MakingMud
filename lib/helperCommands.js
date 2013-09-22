var gameMaster = require

exports.stringMatch = function (strProvided, strToMatch) {
	if (strProvided.length === 0) {
		return true;
	}
	var lowerProv = strProvided.toLowerCase(); 
	var lowerMatch = strToMatch.toLowerCase();
	var position = lowerMatch.indexOf(lowerProv);
	while (position != -1) {
		if (position === 0 || lowerMatch[position-1] == " ") 
		{
			return true;
		}
		position = lowerMatch.indexOf(lowerProv, position + 1);
	}
	return false;
}

// say to world
exports.worldCast = function (gameMaster, message) {
	gameMaster.sockets.forEach(function (socket) {
		socket.send(JSON.stringify(message));
	});
}

// say to room
exports.roomCast = function (roomId, gameMaster, message) {
	gameMaster.getRoom(roomId, function(err, room) {
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
}

// say to user
exports.userCast = function (name, gameMaster, message) {
	gameMaster.getUser(name, function(err, user) {
		if (err) {
			return console.error(err);
		}
		user.socket.send(JSON.stringify(message));
	});
}

