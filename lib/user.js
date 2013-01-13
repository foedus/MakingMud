var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.User = function(userName) {
	var parent = this;
	this.userName = userName;
	this.getUser = function (userName, cb) {
		console.log('Received request to get user ' + userName);
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			users.findOne({'userName':userName}, function(err, userData) {
				if (!err) {
					parent._id = userData._id;
					parent.roomId = userData.roomId;
				}
				return cb(err, userData);
			});
		});
	}
	this.setRoom = function (roomId, cb) {
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			users.findOne({'userName':parent.userName}, function(err, userData) {
				if (!err) {
					parent.roomId = roomId;
					users.update({'userName': parent.userName}, {$set:{'roomId': roomId}}, function(err, stuff) {
						return cb(err, stuff);
					});
				}
			});
		});	
	}
}