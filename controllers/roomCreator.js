var Room = require('../models/roomModel');

// New room
exports.new = function(req, res){
	var room = new Room({});
	res.render('rooms/new', {
		title: 'New Room',
		room: room
	})
};

// Create a room
exports.create = function (req, res) {
	console.log('Create called.');
	console.log(req.body); 
  	room.save(function(err){
	      if (err) {
	        res.render('rooms/new', {
	            title: 'New Room',
	            room: new Room({}),
	            errors: err.errors
	        })
	      }
	      else {
	        res.redirect('/rooms/'+room._id)
	      }
	})
};

// Edit a room
exports.edit = function (req, res) {
	Room.findOne({_id:req.params.id}, function(err, room) {
		if (!err) {
			res.render('rooms/edit', {
				title: 'Edit ' + room.title,
				room: room
			});
		}
	})  
};

// Update room
exports.update = function(req, res) {
	console.log('Update called.');
	console.log(req);
	var room = req.room
	room.save(function(err, doc) {
		if (err) {
			res.render('rooms/edit', {
				title: 'Edit Room',
				room: room,
				errors: err.errors
			})
		}
		else {
			res.redirect('/rooms/'+room._id)
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
}

// Delete a room
exports.destroy = function(req, res){
  console.log('Destroy called.');
  var room = req.room;
  room.remove(function(err){
    res.redirect('/rooms')
  })
}

// Listing of rooms
exports.index = function(req, res){
  var perPage = 15;
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