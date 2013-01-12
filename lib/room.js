var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.Room = function (id) {
	this._id = id;
	this.getRoom = function (id, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var rooms = db.collection('rooms');
			console.log('Received request for room ' + id);
			rooms.findOne({_id:new ObjectID(id)}, function(err,roomData) {
				if (!err) {
					console.log(roomData);
					this.title = roomData.title;
					this.description = roomData.description;
					this.exits = roomData.exits;
					this.north = roomData.north;
					this.south = roomData.south;
					this.east = roomData.east;
					this.west = roomData.west;
					this.northeast = roomData.northeast;
					this.northwest = roomData.northwest;
					this.southeast = roomData.southeast;
					this.southwest = roomData.southwest;
					this.up = roomData.up;
					this.down = roomData.down;
					this.people = roomData.people;
					this.items = roomData.items;
					this.npcs = roomData.npcs;
					return cb(err,roomData);
				}
			});
		});
	}
}