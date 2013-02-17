var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Mongoose connected!');
});

var UserModel = require('./models/userModel'); // Bring in Room and User models for use by functions

var user = new UserModel({
	name: 'Neville',
	online: false,
	roomId: '512136a132bb622f15000002'
});

// Town Square Central :'512136a132bb622f15000002'}, 'east': '51041a2e2aeeb24780000001', 'west': '51041a51e6d8b44a80000001'

user.save(function(err) {
	if (err) {
		return console.error(err);
	}
	console.log('User created!');
});