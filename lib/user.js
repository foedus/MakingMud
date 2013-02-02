// var UserModel = require('../models/userModel');
// 
// var User = function(name) {
// 	var self = this;
// 	self.name = name;
// }
// 
// User.prototype.loadUserInfo = function(name, cb) {
// 	var self = this;
// 	UserModel.findOne({name:name}, function(err, user) {
// 		if (err) {
// 			return console.error(err);
// 		}
// 		self._id = user._id;
// 		self.roomId = user.roomId;
// 		self.online = user.online;
// 		return cb(null);
// 	});
// }
// 
// User.prototype.setRoom = function(roomId, cb) {
// 	var self = this;
// 	UserModel.update({name:self.name}, {roomId:roomId}, function(err) {
// 		return cb(null);
// 	});
// }
// 
// exports.User = User;