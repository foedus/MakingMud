var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
	title: String,
	description: String,
	exits: {},
	notes: String,
	photoPath: String,
	username: String
});

module.exports = mongoose.model('Room', roomSchema);