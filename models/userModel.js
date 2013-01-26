var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	online: Boolean,
	roomId: String
});

module.exports = mongoose.model('User', userSchema);