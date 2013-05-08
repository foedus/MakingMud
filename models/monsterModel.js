var mongoose = require('mongoose');
var Room = require('../models/roomModel'); // since using room functions

var monsterSchema = mongoose.Schema({
	name: String,
	roomId: String,
	description: String,
	stats: {
		attackStrength: Number, 
		defenseStrength: Number
	},
	inventory: {
		weapon: Array, // array of objects with type of weapon and spawn %	
		shield: Array, // ditto
		armor: Array, // ditto
		treasure: Array // ditto
	}
});

userSchema.methods.startMonsterLoop = function() {
	var self = this;
	self.intId = setInterval(function() {
		console.log(self.name + ' heartbeat ping.');
		// decide what will happen to the monster every loop
		
		// self.incrementSpells();
	}, 5000);
}