var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.Room = function (id) {
	var parent = this;
	this._id = id;
	this.getRoom = function (rid, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var rooms = db.collection('rooms');
			console.log('Received request for room ' + rid);
			rooms.findOne({_id:new ObjectID(rid)}, function(err,roomData) {
				db.close();
				if (!err) {
					// console.log(roomData);
					parent.title = roomData.title;
					parent.description = roomData.description;
					parent.exits = roomData.exits;
					parent.north = roomData.north;
					parent.south = roomData.south;
					parent.east = roomData.east;
					parent.west = roomData.west;
					parent.northeast = roomData.northeast;
					parent.northwest = roomData.northwest;
					parent.southeast = roomData.southeast;
					parent.southwest = roomData.southwest;
					parent.up = roomData.up;
					parent.down = roomData.down;
					parent.people = roomData.people;
					parent.items = roomData.items;
					parent.npcs = roomData.npcs;
				}
				return cb(err, roomData);		
			});
		});
	}
	this.checkExits = function (direction, cb) {
		var err = 0;
		if (this[direction] !== '' && this[direction] !== undefined) {
			console.log('The room has a ' + direction + ' exit.');
			return cb(err, true);
		} else {
			console.log('There is no exit to the ' + direction);
			return cb(err, false);
		}
	}
	this.getRoomName = function (id, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var rooms = db.collection('rooms');
			rooms.findOne({"_id":new ObjectID(id)}, function (err, doc) {
				db.close();
				if (!err) {
					return cb(err, doc.title);
				}
			});
		});
	}
}