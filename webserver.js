var express = require('express');
var mongoose = require('mongoose');
var jade = require('jade');

// models
var User = require('./models/userModel');
var Room = require('./models/roomModel');

// Connect to db
mongoose.connect('mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Mongoose connected!');
});

var app = express();

app.configure(function() {
	// app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next) {
	  console.log('handling request for: ' + req.url);
	  next();
	});
	// app.use(express.logger());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.get('/', function(req,res) {
	res.sendfile(__dirname + '/views/index.html');
})

//Room editor
var rooms = require('./controllers/roomCreator');
app.get('/rooms/', rooms.index);
app.get('/rooms/new', rooms.new);
app.post('/rooms', rooms.create);
app.get('/rooms/:id', rooms.show);
app.get('/rooms/:id/edit', rooms.edit);
app.put('/rooms/:id', rooms.update);
app.del('/rooms/:id', rooms.destroy);

app.listen(8080, function () {
	console.log('Webserver running on port 8080...');
});