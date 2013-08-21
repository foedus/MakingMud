var mongoose = require('mongoose');
var Room = require('../models/roomModel'); // since using room functions

var monsterSchema = mongoose.Schema({
	name: String,
	roomId: String,
	description: String,
	stats: {
		physAttack: Number, 
		physDefense: Number,
		magAttack: Number,
		magDefense: Number,
		aggressiveness: Number // 0-100, odds of attacking a user
	},
	healthMax: Number,
	healthCurrent: Number,
	manaMax: Number,
	manaCurrent: Number,
	potentialTreasure: Array, // array of objects with type of weapon and spawn %	
	potentialEquipment: {
		weapon: Array, // array of objects with type of weapon and spawn %	
		shield: Array, // ditto
		armor: Array // ditto
	},
	weapon: String,
	armor: String,
	shield: String,
	treasure: Array, // array of String ids for items generated from list above
	abilities: Array,
	spells: Array,
	activeCombatSpells: Array, // store spells along with start time
	activePeriodicSpells: Array,
	combatFlag: Boolean,
	injuredFlag: Boolean,
	/* IDEA FOR HOW TO DO AI:
	possibleActions: {
		inCombat: {
			attackUser: 90, // action1: chance1
			changeWeapon: 10
		}, 
		noUser: {
			move: 30,
			nothing: 70
		},
		injured: {
			run: 90,
			attack: 10
		}
	} */
});

// This gets called by the room during the gameloop
monsterSchema.methods.spawnMonster = function() {
	var self = this;
	// set intial stats
	// call function to set equipment
	// call function to set treasure
	// call funciton to set initial state flags
	// put monster in room
	// start monster loop
}

monsterSchema.methods.startMonsterLoop = function() {
	var self = this;
	self.intId = setInterval(function() {
		console.log(self.name + ' heartbeat ping.');
		// decide what will happen to the monster every loop
		
		// self.incrementSpells();
	}, 5000);
}

module.exports = mongoose.model('Monster', monsterSchema);