var mongoose = require('mongoose');
var Room = require('../models/roomModel'); // since using room functions

var userSchema = mongoose.Schema({
	name: String,
	online: Boolean,
	roomId: String,
	description: String,
	healthMax: Number,
	healthCurrent: Number,
	manaMax: Number,
	manaCurrent: Number,
	stats: {
		strength: Number,
		agility: Number,
		wisdom: Number,
		intelligence: Number
	},
	inventory: Array,
	abilities: Array,
	spells: Array,
	activeCombatSpells: Array, // store spells along with start time
	activePeriodicSpells: Array
});

userSchema.methods.startUserLoop = function() {
	var self = this;
	self.intId = setInterval(function() {
		console.log(self.name + ' heartbeat ping.');
		self.healthRoom();
		self.manaRoom();
		// self.manaRoom();
		// self.incrementSpells();
	}, 5000);
}

userSchema.methods.healthRoom = function() {
	var self = this;
	Room.findOne({_id:self.roomId}, function(err, room) {
		if (err) {
			console.error(err);
			return cb(err);
		}
		self.healthUpdate(room.healthIndex/100);
	});
}

userSchema.methods.healthUpdate = function(change) {
	var self = this;
	if (self.healthCurrent < self.healthMax) {
		self.healthCurrent = Math.min(self.healthCurrent + change, self.healthMax);
	}
	self.save();
}

userSchema.methods.manaRoom = function() {
	var self = this;
	Room.findOne({_id:self.roomId}, function(err, room) {
		if (err) {
			console.error(err);
			return cb(err);
		}
		self.manaUpdate(room.manaIndex/100);
	});
}

userSchema.methods.manaUpdate = function(change) {
	var self = this;
	if (self.manaCurrent < self.manaMax) {
		self.manaCurrent = Math.min(self.manaCurrent + change, self.manaMax);
	}
	self.save();
}

module.exports = mongoose.model('User', userSchema);