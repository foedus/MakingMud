var User = require('../models/userModel');

// New user
exports.new = function(req, res){
	var user = new User({});
	User.find().exec( function(err, map) {
		if (err) return res.render('500');
		res.render('users/new', {
			title: 'New User',
			user: user,
			map: map
		})
	})
};

// Create a user
exports.create = function (req, res) {
	console.log('Create user called.');
	console.log(req.body.user);
	var user = new User(req.body.user);
	
  	user.save(function(err, doc) {
	      if (err) {
	        res.render('users/new', {
	            title: 'New User',
	            user: new User({}),
	            errors: err.errors
	        })
	      }
	      else {
	        res.redirect('/users/'+user._id)
	      }
	})
};

// Edit a user
exports.edit = function (req, res) {
	User.findOne({_id:req.params.id}, function(err, user) {
		if (!err) {
			User.find().exec( function(err,map) {
				if (err) return res.render('500');
				res.render('users/edit', {
					title: 'Edit ' + user.name,
					user: user,
					map: map
				})
			})
		}
	})  
};

// Update user
exports.update = function(req, res) {
	console.log('Update user called.');
	User.findOne({_id: req.params.id}, function(err, user) {
		if (err) {
			res.render('users/edit', {
				title: 'Edit User',
				user: user,
				errors: err.errors
			})
		}
		else {
			console.log(req.body.user);
			user.name = req.body.user.name;
			user.roomId = req.body.user.roomId;
			user.stats = req.body.user.stats;
			user.healthMax = req.body.user.healthMax;
			user.healthCurrent = req.body.user.healthCurrent;
			user.manaMax = req.body.user.manaMax;
			user.manaCurrent = req.body.user.manaCurrent;
			user.save(function(err, doc) {
				if (err) {
					res.render('users/edit', {
						title: 'Edit User',
						user: user,
						errors: err.errors
					})
				}
				else {
					res.redirect('/users/'+user._id)
				}
			})			
		}

	})

};

// View a user
exports.show = function(req, res){
	console.log('Show user called.');
	User.findOne({_id:req.params.id}, function(err, user) {
		if (!err) {
			res.render('users/show', {
				title: user.name,
				user: user
			});
		}
	})
};

// Delete a user
exports.destroy = function(req, res){
	console.log('Destroy user called.');
	console.log(req.params);
	User.findOne({_id:req.params.id}, function(err, user) {
		if (err) {
			return console.error(err);
		}
		user.remove(function(err){
			if (!err) {
				console.log(user.name + ' deleted.');
				res.redirect('/users');
			}
		})
	})		
};

// Listing of users
exports.index = function(req, res){
  // Pagination not active yet
  console.log(req.params);
  var perPage = 25;
  var page = req.param('page') > 0 ? req.param('page') : 0;

  User
    .find({})
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, users) {
      if (err) return res.render('500')
      User.count().exec(function (err, count) {
        res.render('users/index', {
            title: 'List of Users',
            users: users,
            page: page,
            pages: count / perPage
        })
      })
    })
};