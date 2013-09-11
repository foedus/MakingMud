var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');
var gameserver = require('../gameserver');

var User = require('../models/userModel');

function roller() {
} 

// function to create a blank user and start the creation process
roller.newChar = function (messageEmitter, socket) {
	console.log('--newChar called in ROLLER--')
	
	var self = this,
		rollerState = "pickName",
		message = {},
	 	newUser = new User();
	
	var rollerText = "//" + "\n";
	rollerText = rollerText + "//     CharacterCreator v0.1     " + "\n";
	rollerText = rollerText + "//  (c) SAS/AFS 2013 " + "\n";
	rollerText = rollerText + "//" + "\n" + "\n";
	rollerText = rollerText + "Please enter your name:" + "\n";
	
	var message = {
		"type": "roller",
		"content": rollerText
	};
	messageEmitter.emit('OUT', message);
	
	// HAND OFF TO PICKNAME
	return self.pickName(messageEmitter, socket, newUser, rollerState);
}

// Ask new user for a name and check for uniqueness
roller.pickName = function (messageEmitter, socket, newUser, rollerState) {
	console.log("--pickName called in ROLLER.--");
	console.log("RollerState: " + rollerState);
	console.dir(newUser);
	var self = this;
	
	if (rollerState === "pickName") {
		messageEmitter.once('command', function(data) {
			User.findOne({name: data.data}, function(err, user) {
				if (err) {
					return console.error(err);
				}
				if (user) {
					var message = {
						"type": "roller",
						"content": "That name is in use! Please try again."
					};
					messageEmitter.emit('OUT', message);
					return self.pickName(messageEmitter, socket, newUser, rollerState)
				}
				if (!user) {
					var message = {
						"type": "roller",
						"content": "Thank you, " + data.data + ". Please choose a password."
					};
					messageEmitter.emit('OUT', message);
					newUser.name = data.data;
					console.log('---Changing RollerState to pickPassOne---');
					rollerState = "pickPassOne";
					
					var tempPass = ""; // not using real passwords yet, but we'll test the function here.
										// have to pass in password from here because the function is called recursively and we need the variable to persist
					
					// HAND OFF TO PICKPASS
					return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
				}
			});
		});
	}	
}	

// if name checks out, ask to set a password
roller.pickPassword = function (messageEmitter, socket, newUser, rollerState, tempPass) {
	console.log("--pickPassword called in ROLLER.--");
	console.log("RollerState: " + rollerState);
	var self = this;
	
	if (rollerState === "pickPassOne") {
		messageEmitter.once('command', function(data) {
			tempPass = data.data;
			var message = {
				"type": "roller",
				"content": "Please confirm your password:"
			};
			rollerState = "pickPassTwo";
			messageEmitter.emit('OUT', message);
			return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
		})
	} 
	if (rollerState === "pickPassTwo") {
		messageEmitter.once('command', function(data) {
			if (tempPass === data.data) {
				var message = {
					"type": "roller",
					"content": "Password confirmed. Please pick your stats."
				};
				rollerState = "pickStats";
				messageEmitter.emit('OUT', message);
				var rollArray = self.roll(messageEmitter);
				return self.pickStats(messageEmitter, socket, newUser, rollerState, rollArray);
			} 
			var message = {
				"type": "roller",
				"content": "Password does not match. Please confirm again."
			};
			messageEmitter.emit('OUT', message);
			rollerState = "pickPassThree";
			return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
		})
	}
	if (rollerState === "pickPassThree") {
		messageEmitter.once('command', function(data) {
			if (tempPass === data.data) {
				var message = {
					"type": "roller",
					"content": "Password confirmed. Please pick your stats."
				};
				rollerState = "pickStats";
				messageEmitter.emit('OUT', message);
				var rollArray = self.roll(messageEmitter);
				return self.pickStats(messageEmitter, socket, newUser, rollerState, rollArray);
			} 
			var message = {
				"type": "roller",
				"content": "Confirmation failed, please pick a new password."
			};
			rollerState = "pickPassOne";
			messageEmitter.emit('OUT', message);
			return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
		})
	}
		
}

roller.roll = function(messageEmitter) {

	console.log('roller rolling');

	var roll1 = 80 + Math.ceil(Math.random() * 20),
		roll2 = 80 + Math.ceil(Math.random() * 20),
		roll3 = 70 + Math.ceil(Math.random() * 20),
		roll4 = 70 + Math.ceil(Math.random() * 20),
		roll5 = 50 + Math.ceil(Math.random() * 30),
		roll6 = 50 + Math.ceil(Math.random() * 20),
		roll7 = 20 + Math.ceil(Math.random() * 60),
		rollArray = [roll1,roll2,roll3,roll4,roll5,roll6,roll7],
		total = (roll1 + roll2 + roll3 + roll4 + roll5 + roll6 + roll7),
		backupArray = rollArray.slice();

	var	resultString = 'Your result was: \n';
	resultString += 'First Roll: ' + roll1 + '\n';
	resultString += 'Second Roll: ' + roll2 + '\n';
	resultString += 'Third Roll: ' + roll3 + '\n';
	resultString += 'Fourth Roll: ' + roll4 + '\n';
	resultString += 'Fifth Roll: ' + roll5 + '\n';
	resultString += 'Sixth Roll: ' + roll6 + '\n';
	resultString += 'Seventh Roll: ' + roll7 + '\n';
	resultString += 'Total Points: ' + total + '/610\n';
	resultString += 'Keep result? (y/n)';
	
	message = {
		"type": "roller",		
		"content" : resultString
	};
	
	messageEmitter.emit('OUT', message);

	return rollArray;

}

// once pw is stored, roll new stats
roller.pickStats = function (messageEmitter, socket, user, rollerState, rollArray) {
	console.log('--statsRoller called in ROLLER--');
	console.log("RollerState: " + rollerState);
	var self = this,
		newUser = user;
	
	// in final version, these should be first assigned to "roll1," "roll2," etc.
	// then player can choose where to assign stats.
	
	if (rollerState === "pickStats") {
		messageEmitter.once('command', function(data) {
			if (data.data === "y") {	
				var statsArray = ['strength','constitution','agility','aptitude','focus','logic','creativity'];
				var statsCounter = 0;
				self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
			} else if (data.data === "n") {
				var message = {
					"type": "roller",
					"content": "Rolling again."
				};
				messageEmitter.emit('OUT', message);
				rollArray = self.roll;
				return self.pickStats(messageEmitter, socket, newUser, rollerState, rollArray);
			} else {
				var message = {
					"type": "roller",
					"content": "Invalid entry."
				};
				messageEmitter.emit('OUT', message);
				return self.pickStats(messageEmitter, socket, newUser, rollerState, rollArray);
			}
		})
	}
}

roller.statAssigner = function (messageEmitter, user, socket, statsArray, statsCounter, rollArray) {
	var self = this,
		newUser = user;
		
	if (statsCounter > 6) {
		self.confirmStats(messageEmitter, newUser, socket)
	} else {
		var message = {
			"type": "roller",
			"content": "Assign a roll to " + statsArray[statsCounter] + ". (1-7)"
		};
		messageEmitter.emit('OUT', message);
	
		messageEmitter.once('command', function (data) {
			console.log('CALLING SWITCH STATEMENT: ' + statsCounter);
			switch (data.data) {
				case "1":
					console.log('Printing ROLLARRAY in case 1: ');
					console.log(rollArray);
					if (rollArray[0] === 0)	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[0];
						rollArray[0] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;		
				case "2":
					if (rollArray[1] === 0)	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[1];
						rollArray[1] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;		
				case "3":
					if (rollArray[2]===0)	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[2];
						rollArray[2] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;
				case "4":
					if (rollArray[3]==="0")	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[3];
						rollArray[3] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;
				case "5":
					if (rollArray[4]==="0")	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[4];
						rollArray[4] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;
				case "6":
					if (rollArray[5]==="0")	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[5];
						rollArray[5] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;
				case "7":
					if (rollArray[5]==="0")	{
						var message = {
							"type": "roller",
							"content": "Stat already used. Pick another."
						}
						messageEmitter.emit('OUT', message);
					} else {
						newUser.stats[statsArray[statsCounter]] = rollArray[6];
						rollArray[6] = 0;
						var message = {
							"type": "roller",
							"content": "Stat assigned."
						}
						messageEmitter.emit('OUT', message);
						statsCounter++;
						return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					}
					break;
				default:
					var message = {
						"type": "roller",
						"content": "Invalid entry, please try again."
					}
					messageEmitter.emit('OUT', message);
					return self.statAssigner(messageEmitter, newUser, socket, statsArray, statsCounter, rollArray);
					break;
			}
		});
	}
}

roller.confirmStats = function (messageEmitter, user, socket) {
	var self = this,
		newUser = user;
		
	var	currentStats = 'Your final stats are: \n';
	currentStats += 'Strength: ' + user.stats.strength + '\n';
	currentStats += 'Constitution: ' + user.stats.constitution + '\n';
	currentStats += 'Agility: ' + user.stats.agility + '\n';
	currentStats += 'Aptitude: ' + user.stats.aptitude + '\n';
	currentStats += 'Focus: ' + user.stats.focus + '\n';
	currentStats += 'Logic: ' + user.stats.logic + '\n';
	currentStats += 'Creativity: ' + user.stats.creativity + '\n';
	currentStats += 'Keep result? (y/n)';

	message = {
		"type": "roller",		
		"content" : currentStats
	};
	messageEmitter.emit('OUT', message);
	
	messageEmitter.once('command', function(data) {
		if (data.data === 'y') {
			newUser.healthMax = newUser.stats.constitution;
			newUser.healthCurrent = newUser.stats.constitution;
			newUser.manaMax = (newUser.stats.focus + newUser.stats.logic)/2;
			newUser.manaCurrent = 0;
			messageEmitter.user = newUser; // save completed user obj to messageEmitter for passing
			return self.startUser(messageEmitter, socket);
		} else if (data.data === 'n') {
			message = {
				"type": "roller",		
				"content" : "Sucks for you."
			};
			return messageEmitter.emit('OUT', message);
		} else {
			message = {
				"type": "roller",		
				"content" : "Invalid entry. Try again."
			};
			messageEmitter.emit("OUT", message);
			return self.confirmStats(messageEmitter, user, socket);
		}	
	});
}

// once stats are selected, start the game by calling loadUser from gameserver
roller.startUser = function (messageEmitter, socket) {
	console.log("--loadUser called in ROLLER--")
	
	var message = {
		"type": "roller",
		"content": "Character creation successful! Enjoy the game."
	};
	messageEmitter.emit('OUT', message);
	gameserver.loadUser(messageEmitter, socket);
}

exports.roller = roller;