var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.Room = function (id) {
	var self = this;
	self._id = id;
	self.getRoom = function (rid, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var rooms = db.collection('rooms');
			rooms.findOne({_id:new ObjectID(rid)}, function(err,roomData) {
				db.close();
				if (!err) {
					// console.log(roomData);
					self.title = roomData.title;
					self.description = roomData.description;
					self.exits = roomData.exits;
					self.north = roomData.north;
					self.south = roomData.south;
					self.east = roomData.east;
					self.west = roomData.west;
					self.northeast = roomData.northeast;
					self.northwest = roomData.northwest;
					self.southeast = roomData.southeast;
					self.southwest = roomData.southwest;
					self.up = roomData.up;
					self.down = roomData.down;
					self.people = roomData.people;
					self.items = roomData.items;
					self.npcs = roomData.npcs;
				}
				return cb(err, roomData);		
			});
		});
	};
	self.checkExits = function(direction) {
		return this[direction];
	};
	self.getRoomName = function (id, cb) {
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


// Room.prototype.say = function (who, what) {
// 	lgth = what.length;
// 	this.onlineUsers.forEach(function (user) {
// 		var message = {
// 			type: 'say',
// 			who: who,
// 			content: what.substr(4,lgth)
// 		}
// 		user.socket.send(JSON.stringify(message));
// 	});
// };