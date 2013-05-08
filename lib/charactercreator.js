var engine = require('engine.io');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');

var User = require('./models/userModel');

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

function characterCreator () {
	var self = this;
}

characterCreator.pickName = function () {
	console.log("pickName called in characterCreator.");
	var user = new User();
	user.save();
}




