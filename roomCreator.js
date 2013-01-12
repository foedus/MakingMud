var MongoClient = require('mongodb').MongoClient;

var Room = function (title) {
	this.title = title;
	this.description = '';
	this.exits = {};
	this.north = '';
	this.south = '';
	this.east = '';
	this.west = '';
	this.northeast = '';
	this.northwest = '';
	this.southeast = '';
	this.southwest = '';
	this.up = '';
	this.down = '';
	this.people = [];
	this.items = [];
	this.npcs = [];
}

var room1 = new Room('TownSquare North');
room1.description = 'From the north side of the townsquare you can see the center of the townsquare to the south.';

var room2 = new Room('TownSquare South');
room2.description = 'From the south side of the townsquare you can see the center of the townsquare to the north.';

MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
	var rooms = db.collection('rooms');
	rooms.insert(room1, function(err,result) {
		if (!err) {
			console.log('Success!');
		}
	});
	rooms.insert(room2, function(err,result) {
		if (!err) {
			console.log('Success!');
		}
	});
});