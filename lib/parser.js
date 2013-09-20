function Parser() {}
 
Parser.command = function(messageEmitter, data, gameMaster) {

	var user = messageEmitter.user;
	
	// Handlers for special pre-login command types: menu, login, roller, password
		// Insert login commands here eventually?
	// End special login commands

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
	
	var attack = function(messageEmitter, data, gameMaster) {
		var attacker = user;
		var targetName = data.slice(7);
		// Need to clean up next ~10 lines; can be more elegant
		if(gameMaster['users'][targetName]) {
			var target = gameMaster['users'][targetName];
		} else {
			var message = {
				type: 'error',
				content: 'Invalid target!'
			}
			messageEmitter.emit('OUT',message);
			return;			
		}
		// check to see if real user in gameMaster
		if (attacker.roomId !== target.roomId) {
			var message = {
				type: 'error',
				content: 'Invalid target!'
			}
			messageEmitter.emit('OUT',message);
			return;
		}
		var outcome = roll(attacker, target);
		
		// Should create a send to room, send to target, or send privately method for different types of broadcasts
		gameMaster.getRoom(messageEmitter.room, function(err, room) {
			if (err) {
				return console.error(err);
			}
			if (!room) {
				return console.log('No room found.');
			}
			room.users.forEach(function(user) {
				user.socket.send(JSON.stringify(outcome));
			});
		});
	}
	
	// Need to make target name case insensitive
	// Need to make sure can't attack one's self
	
	var roll = function(attacker, target) {
		var randomAttack = Math.floor(Math.random()*100);
		var randomDefense = Math.floor(Math.random()*100);
		var attackStrength = Math.floor(((attacker.stats.strength/4) + (attacker.stats.agility/4)) * (attacker.healthCurrent/attacker.healthMax) + randomAttack);
		var defenseStrength = Math.floor(((target.stats.agility/4) + (target.stats.constitution/4)) * (target.healthCurrent/target.healthMax) + randomDefense);
		var attackDescription = attacker.name + " attacks " + target.name + "!\n"
		attackDescription += attacker.name + " rolled " +  randomAttack + " for an AttackStrength of: " + attackStrength + ".\n";
		attackDescription += target.name + " rolled " + randomDefense + " for a DefenseStrength of: " + defenseStrength + ".\n";
		if (attackStrength > defenseStrength) {
			var result = Math.floor((attackStrength - defenseStrength)/4);
			target.healthUpdate(0-result);
			attackDescription += 'A hit! You do ' + result + ' damage to ' + target.name + '.';
			var message = {
				type: 'combat',
				content: attackDescription
			}
		} else {
			attackDescription += 'You miss!';
			var message = {
				type: 'combat',
				content: attackDescription
			}
		}
		return message;
	}

	// First test if command is speaking
	if (/^'.*/.test(data)) {

		var message = {
			type: 'say',
			name: user.name,
			content: data.slice(1)
		};

		gameMaster.getRoom(messageEmitter.room, function(err, room) {
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

	// Next, if not speaking, then work through all other commands

	} else {

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
		commandsArray['attack'] = attack;
		
		var rawCommand = data.split(' ')[0];
		
		// Checks to see if in commands array
		if (!commandsArray[rawCommand]) {
			message = {
				type: 'error',
				content: '**command not found**'
			};
			return messageEmitter.emit('OUT', message);
		}	
	
		// Calls function based on key/value - command/method - mapping
		commandsArray[rawCommand](messageEmitter, data, gameMaster);
	
	}
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