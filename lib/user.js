var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.User = function(userName) {
	var self = this;
	// Once made "self = this" no longer user "this" below...
	this.userName = userName;
	this.getUser = function (userName, cb) {
		console.log('Received request to get user ' + userName);
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			users.findOne({'userName':userName}, function(err, userData) {
				db.close();
				if (!err) {
					self._id = userData._id; // May not need
					self.roomId = userData.roomId; // May not need
				}
				return cb(err, userData);
			});
		});
	}
	this.setRoom = function (roomId, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			self.roomId = roomId; // May not need
			users.update({'userName': self.userName}, {$set:{'roomId': roomId}}, function(err, stuff) {
				db.close();
				return cb(err, stuff);
			});
		});	
	}
	this.initializeUser = function (socket, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			users.update({'userName': self.userName}, {$set:{'online': true}}, function(err, stuff) {
				db.close();
				return cb(err, stuff);
			});
		});
	}
}