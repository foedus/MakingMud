var engine = require('engine.io');
var gameserver = engine.listen(8083, function() {
	console.log('Gameserver listening on port 8083...');
});

// room

// user

// mongo db

gameserver.on('connection', function (socket) {
	socket.on('message', function (data) {
		if (/^say .*/.test(data)) {
			socket.send(JSON.stringify(data));
		}
	});
});

