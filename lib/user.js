var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.User = function(userName) {
	this.userName = userName;
	this.getUser = function (userName, cb) {
		console.log('Received request to get user ' + userName);
		MongoClient.connect('mongodb://localhost:27017/MakingMud', function(err, db) {
			var users = db.collection('users');
			users.findOne({'userName':userName}, function(err,userData) {
				if (!err) {
					this._id = userData._id;
					this.roomId = userData.roomId;
					return cb(err,userData);
				}
			});
		});
	}
}