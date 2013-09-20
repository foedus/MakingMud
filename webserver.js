var express = require('express');
var engine = require('engine.io');
var mongoose = require('mongoose');
var jade = require('jade');
var gameserver = require('./gameserver');

// models
var User = require('./models/userModel');
var Room = require('./models/roomModel');

// Connect to db
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/MakingMud');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Mongoose connected!');
});

var app = express();

var http = require('http').createServer(app).listen(process.env.PORT || 8080);
var server = engine.attach(http);

engine.listen(app, function () {
	console.log('Engine.io listening on %d', process.env.PORT || 8080);
	gameserver.startGame(server);
});

app.configure(function() {
	// app.set('views', __dirname + '/views');
	app.set('port', process.env.PORT || 8080);
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next) {
	  console.log('handling request for: ' + req.url);
	  next();
	});
	// app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.get('/', function(req,res) {
	res.sendfile(__dirname + '/views/index.html');
});

app.get('/tools', function(req,res) {
	res.render(__dirname + '/views/tools.jade');
});

// Rooms editor
var rooms = require('./controllers/roomCreator');
app.get('/rooms', rooms.index);
app.get('/rooms/new', rooms.new);
app.post('/rooms', rooms.create);
app.get('/rooms/:id', rooms.show);
app.get('/rooms/:id/edit', rooms.edit);
app.put('/rooms/:id', rooms.update);
app.del('/rooms/:id', rooms.destroy);

// User editor
var users = require('./controllers/userCreator');
app.get('/users', users.index);
app.get('/users/new', users.new);
app.post('/users', users.create);
app.get('/users/:id', users.show);
app.get('/users/:id/edit', users.edit);
app.put('/users/:id', users.update);
app.del('/users/:id', users.destroy);

/* server.listen(app.get('port'), function () {
	console.log('Webserver running on %d in %s mode', app.get('port'), app.settings.env);
}); */