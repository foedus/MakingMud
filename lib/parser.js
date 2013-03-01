function Parser() {
}
 
Parser.command = function(messageEmitter, data, gameMaster) {
	var user = messageEmitter.user;
	
	var dirArray = ['north','south','east','west','northeast','southeast','northwest','southwest','up','down'];

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
}

exports.Parser = Parser;

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
