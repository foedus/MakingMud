var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	online: Boolean,
	roomId: String
});

// userSchema.virtual('socket').set(function (userSocket) {
// 	this.userSocket = userSocket;
// });
// 
// userSchema.virtual('socket').get(function () {
//   return this.userSocket;
// });

// mad.name.full = 'Breaking Bad';
// console.log(mad.name.first); // Breaking

// userSchema.static.getUser = function(name, cb) {
// 	var self = this;
// 	return self.findOne({name: name}, cb);
// }

// userSchema.methods.loadUserInfo = function(name, cb) {
// 	var self = this;
// 	self.model('User').findOne({name: name}, function(err, user) {
// 		console.log('from model');
// 		console.log(user);
// 		if (err) {
// 			return console.error(err);
// 		}
// 		self._id = user._id;
// 		self.roomId = user.roomId;
// 		self.online = user.online;
// 		return cb(null);
// 	});
// }

userSchema.methods.setRoom = function(roomId, user, cb) {
	var self = this;
	self.model('User').update({name:self.name}, {roomId:roomId}, function(err) {
		return cb(null);
	});
}

module.exports = mongoose.model('User', userSchema);