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
				return self.pickStats(messageEmitter, socket, newUser, rollerState);
			} 
			var message = {
				"type": "roller",
				"content": "Password does not match. Please confirm again."
			};
			messageEmitter.emit('OUT', message);
			return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
		})
	}	
}

// once pw is stored, roll new stats
roller.pickStats = function (messageEmitter, socket, newUser, rollerState) {
	console.log('--statsRoller called in ROLLER--');
	console.log("RollerState: " + rollerState);
	var self = this;
	
	var strength = 50 + Math.ceil(Math.random() * 50),
		constitution = 50 + Math.ceil(Math.random() * 50),
		agility = 50 + Math.ceil(Math.random() * 50),
		aptitude = 50 + Math.ceil(Math.random() * 50),
		focus = 50 + Math.ceil(Math.random() * 50),
		logic = 50 + Math.ceil(Math.random() * 50),
		creativity = 50 + Math.ceil(Math.random() * 50),
		total = (strength + constitution + agility + aptitude + focus + logic + creativity);

	var	resultString = 'Your result was: \n';
	resultString += 'Strength: ' + strength + '\n';
	resultString += 'Constitution: ' + constitution + '\n';
	resultString += 'Agility: ' + agility + '\n';
	resultString += 'Aptitude: ' + aptitude + '\n';
	resultString += 'Focus: ' + focus + '\n';
	resultString += 'Logic: ' + logic + '\n';
	resultString += 'Creativity: ' + creativity + '\n';
	resultString += 'Total Points: ' + total + '\n';
	resultString += 'Keep result? (y/n)';
	
	message = {
		"type": "roller",
		"subtype": "stats",		
		"content" : resultString
	};
	messageEmitter.emit('OUT', message);
		
	if (rollerState === "pickStats") {
		messageEmitter.once('command', function(data) {
			if (data.data === "y") {
				var message = {
					"type": "roller",
					"content": "Stats confirmed. Enjoy the game!"
				};
				
				// assign user stats
				newUser.stats.strength = strength;
				newUser.stats.constitution = constitution;
				newUser.stats.agility = agility;
				newUser.stats.aptitude = aptitude;
				newUser.stats.focus = focus;
				newUser.stats.logic = logic;
				newUser.stats.creativity = creativity;
				messageEmitter.emit('OUT', message);
				
				// fill in basic user attributes now that stats are final.
				newUser.healthMax = constitution;
				newUser.healthCurrent = constitution;
				newUser.manaMax = (focus + logic)/2;
				newUser.manaCurrent = 0;
				
				messageEmitter.user = newUser; // save completed user obj to messengeEmitter for passing
				
				return self.startUser(messageEmitter, socket);
			} else if (data.data === "n") {
				var message = {
					"type": "roller",
					"content": "Rolling again. \n"
				};
				messageEmitter.emit('OUT', message);
				return self.pickStats(messageEmitter, socket, newUser, rollerState);
			} 
		})
	}
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