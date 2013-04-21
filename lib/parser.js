function Parser() {
}
 
Parser.command = function(messageEmitter, data, gameMaster) {

	var user = messageEmitter.user;

	var move = function(messageEmitter, data, gameMaster) {
		var direction = data;
		console.log(direction);
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
	} // end move()
	
	var logout = function () {
		user.online = false;
		user.save(function (err) {
			if (err) {
				return console.error(err);
			}
			var message = {
				type: 'logout',
				content: "Thanks for playing, see you soon!"
			}
			messageEmitter.emit('OUT', message);
			user.socket.close();
		});
	}

	// Setup commands array
	var commandsArray = new Array();
	commandsArray['north'] = move;
	commandsArray['northeast'] = move;
	commandsArray['east'] = move;
	commandsArray['southeast'] = move;
	commandsArray['south'] = move;
	commandsArray['southwest'] = move;
	commandsArray['west'] = move;
	commandsArray['northwest'] = move;
	commandsArray['logout'] = logout;
	commandsArray['quit'] = logout;

	// Checks to see if in commands array

	/* 
	 * Should here check if "say" or "command" and direct to proper place
	 *  
	 */

	if (!commandsArray[data]) {
		message = {
			type: 'error',
			content: '**command not found**'
		};
		return messageEmitter.emit('OUT', message);
	}	
	
	// Calls function based on key/value - command/method - mapping
	commandsArray[data](messageEmitter, data, gameMaster);

}

exports.Parser = Parser;

// Roman's code
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