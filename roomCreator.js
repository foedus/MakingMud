var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Mongoose connected!');
});

var RoomModel = require('./models/roomModel'); // Bring in Room and User models for use by functions

// var room = new RoomModel({
// 	title: 'Town Square West',
// 	description: 'You find yourself on the western edge of the crowded marketplace.',
// 	exits: {
// 		'east':'510419ce7478d44180000001'
// 	}
// });

RoomModel.update({_id:'510419ce7478d44180000001'}, {exits: {'east': '51041a2e2aeeb24780000001', 'west': '51041a51e6d8b44a80000001'}}, function(err, room) {
	if (err) {
		return console.log(err);
	}
	return console.log('Update Success!');
});

// room.save(function(err) {
// 	if (err) {
// 		return console.error(err);
// 	}
// 	console.log('Room created!');
// });