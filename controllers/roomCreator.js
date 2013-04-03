var Room = require('../models/roomModel');

// Code to handle exit updates when editing rooms
function remapExits(room) {
	console.log('-----UpdateExits----')
	console.log(room.exits);
	// iterate through all this rooms exits
	// if an exit exists, find that room
	// update the opposite exit of that room with this rooms id
	var exitPaths = Object.getOwnPropertyNames(room.exits);
	exitPaths.forEach(function(item) {
		var oppExit = '';
		switch (item) {
			case 'north':
				oppExit = 'south';
				break;
			case 'south':
				oppExit = 'north';
				break;
			case 'west':
				oppExit = 'east';
				break;
			case 'east':
				oppExit = 'west';
				break;
			case 'northeast':
				oppExit = 'southwest';
				break;
			case 'northwest':
				oppExit = 'southeast';
				break;
			case 'southeast':
				oppExit = 'northwest';
				break;
			case 'southwest':
				oppExit = 'northeast';
				break;
			case 'up':
				oppExit = 'down';
				break;
			case 'down':
				oppExit = 'up';
				break;
			default:
				break;
		}		
		if (item !== 'other' && room.exits[item] !== '') {
			console.log(room.exits[item]);
			var updateString = 'exits.' + oppExit;
			var id = room.exits[item];
			Room.findById(id, function(err, exitRoom) {
				if (err) {
					return console.error(err);
				}
				console.log(room.title + ' had an exit to the ' + item + '.');
				console.log('Exits updated for ' + exitRoom.title + ' heading ' + oppExit + '.');
				exitRoom.exits[oppExit] = room._id;
				exitRoom.save(function(err) {
					if (err) {
						return console.error(err);
					}
				})
			})
		}
	})
};

// New room
exports.new = function(req, res){
	var room = new Room({});
	Room.find().exec( function(err,map) {
		if (err) return res.render('500');
		res.render('rooms/new', {
			title: 'New Room',
			room: room,
			map: map
		})
	})
};

// Create a room
exports.create = function (req, res) {
	console.log('Create called.');
	console.log(req.body);
	var room = new Room(req.body.room);
	
  	room.save(function(err, doc) {
	      if (err) {
	        res.render('rooms/new', {
	            title: 'New Room',
	            room: new Room({}),
	            errors: err.errors
	        })
	      }
	      else {
			room = room.toObject();
			remapExits(room);
	        res.redirect('/rooms/'+room._id)
	      }
	})
};

// Edit a room
exports.edit = function (req, res) {
	Room.findOne({_id:req.params.id}, function(err, room) {
		if (!err) {
			Room.find().exec( function(err,map) {
				if (err) return res.render('500');
				res.render('rooms/edit', {
					title: 'Edit ' + room.title,
					room: room,
					map: map
				})
			})
		}
	})  
};

// Update room
exports.update = function(req, res) {
	console.log('Update called.');
	console.log(req);
	Room.findOne({_id: req.params.id}, function(err, room) {
		if (err) {
			res.render('rooms/edit', {
				title: 'Edit Room',
				room: room,
				errors: err.errors
			})
		}
		else {
			room.title = req.body.room.title;
			room.description = req.body.room.description;
			room.exits = req.body.room.exits;
			room.healthIndex =  req.body.room.healthIndex;
			room.manaIndex = req.body.room.manaIndex;
			room.save(function(err, doc) {
				if (err) {
					res.render('rooms/edit', {
						title: 'Edit Room',
						room: room,
						errors: err.errors
					})
				}
				else {
					room = room.toObject();
					remapExits(room);
					res.redirect('/rooms/'+room._id)
				}
			})			
		}

	})

};

// View a room
exports.show = function(req, res){
	console.log('Show called.');
	Room.findOne({_id:req.params.id}, function(err, room) {
		if (!err) {
			res.render('rooms/show', {
				title: room.title,
				room: room
			});
		}
	})
};

// Delete a room
exports.destroy = function(req, res){
	console.log('Destroy called.');
	console.log(req.params);
	Room.findOne({_id:req.params.id}, function(err, room) {
		if (err) {
			return console.error(err);
		}
		room.remove(function(err){
			if (!err) {
				console.log(room.title + ' deleted.');
				res.redirect('/rooms');
			}
		})
	})		
};

// Listing of rooms
exports.index = function(req, res){
  // Pagination not active yet
  console.log(req.params);
  var perPage = 25;
  var page = req.param('page') > 0 ? req.param('page') : 0;

  Room
    .find({})
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, rooms) {
      if (err) return res.render('500')
      Room.count().exec(function (err, count) {
        res.render('rooms/index', {
            title: 'List of Rooms',
            rooms: rooms,
            page: page,
            pages: count / perPage
        })
      })
    })
};