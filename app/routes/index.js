'use strict';

var path = process.cwd();

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/facebook');
		}
	}

	app.route('/')
		.get(function (req, res) {
			res.render(process.cwd() + '/public/index', { user : req.user });
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect(req.headers.referer);
		});

	// app.route('/profile')
	// 	.get(isLoggedIn, function (req, res) {
	// 		res.sendFile(path + '/public/profile.html');
	// 	});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user);
		});

	app.route('/auth/facebook')
		.get(passport.authenticate('facebook'));

	app.route('/auth/facebook/callback')
		.get( passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
			res.redirect(req.headers.referer);
		});

};


// http://expressjs.com/ko/guide/routing.html