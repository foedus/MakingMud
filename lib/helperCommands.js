var gameMaster = require

exports.stringMatch = function (strProvided, arrayToMatch) {
	var lowerProv = strProvided.toLowerCase();
	var target;
	
	if (strProvided.length === 0) {
		return arrayToMatch[0];
	}
	
	arrayToMatch.forEach(function (potentialTarget) {
		var lowerMatch = potentialTarget.toLowerCase();
		var position = lowerMatch.indexOf(lowerProv);
		while (position != -1) {
			if (position === 0 || lowerMatch[position-1] == " ") {
				target = potentialTarget;
			}
			position = lowerMatch.indexOf(lowerProv, position + 1);
		}
		return false;
	});

	return target;

}

// say to world
exports.worldTalk = function (gameMaster, message) {
	gameMaster.sockets.forEach(function (socket) {
		socket.send(JSON.stringify(message));
	});
}

// say to room
exports.roomTalk = function (roomId, gameMaster, message) {
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
exports.userTalk = function (name, gameMaster, message) {
	gameMaster.getUser(name, function(err, user) {
		if (err) {
			return console.error(err);
		}
		user.socket.send(JSON.stringify(message));
	});
}

