var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');
var loadUser = require('../gameserver').loadUser;

var User = require('../models/userModel');

// How this will work:
// Make sure there is back and forth communication for security. User should not be able to edit a variable and
// 	access characterCreator from gameserver
// 	choose a name
// 	check name against db
// 	if name is unique
// 	choose a password
// 	store password in db
// 	open the roller
// 	roll stats
// 	approve or roll again
// 	if approve, save character and launch game
// 	if not re-roll
// 	return to gameserver

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
		messageEmitter.on('command', function(data) {
			User.findOne({name: data.data}, function(err, user) {
				if (err) {
					return console.error(err);
				}
				if (user) {
					var message = {
						"type": "roller",
						"content": "That name is in use! Please try again."
					};
					return messageEmitter.emit('OUT', message);
				}
				if (!user) {
					var message = {
						"type": "roller",
						"content": "Thank you, " + data.data + ". Please choose a password."
					};
					messageEmitter.emit('OUT', message);
					newUser.name = data.data;
					rollerState = "pickPassOne";
					
					var tempPass = ""; // not using real passwords yet, but we'll test the function here.
										// have to pass in password from here because the function is called recursively and we need the variable to persist
					
					// HAND OFF TO PICKPASS
					return self.pickPassword(messageEmitter, socket, newUser, rollerState, tempPass);
				}
			})
		})
	}	
}	

// if name checks out, ask to set a password
roller.pickPassword = function (messageEmitter, socket, newUser, rollerState, tempPass) {
	console.log("--pickPassword called in ROLLER.--");
	console.log("RollerState: " + rollerState);
	var self = this;
	
	if (rollerState === "pickPassOne") {
		messageEmitter.on('command', function(data) {
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
		messageEmitter.on('command', function(data) {
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
			return messageEmitter.emit('OUT', message);
		})
	}
}

// once pw is stored, open roll new stats
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
		messageEmitter.on('command', function(data) {
			if (data.data === "y") {
				var message = {
					"type": "roller",
					"content": "Stats confirmed. Enjoy the game!"
				};
				newUser.stats.strength = strength;
				newUser.stats.constitution = constitution;
				newUser.stats.agility = agility;
				newUser.stats.aptitude = aptitude;
				newUser.stats.focus = focus;
				newUser.stats.logic = logic;
				newUser.stats.creativity = creativity;
				messageEmitter.emit('OUT', message);
				messageEmitter.user = newUser;
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
	loadUser(messageEmitter, socket);
}

exports.roller = roller;