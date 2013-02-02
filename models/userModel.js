var mongoose = require('mongoose');

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
	setInterval(function() {
		self.incrementHealth();
		self.incrementMana();
		self.incrementSpells();
	}, 5000);
}

userSchema.methods.incrementHealth = function() {
	var self = this;
	if (self.healthCurrent < self.healthMax) {
		self.healthCurrent += 1;
		self.save();
	}
}

userSchema.methods.incrementMana = function() {
	var self = this;
	if (self.manaCurrent < self.manaMax) {
		self.manaCurrent += 1;
		self.save();
	}
}

userSchema.methods.incrementSpells = function() {
	var self = this;
	if (self.activeSpells.length == 0) return;
	// Decrement from start time of both combat and periodic spells
}

module.exports = mongoose.model('User', userSchema);