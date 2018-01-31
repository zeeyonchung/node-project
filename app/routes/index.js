'use strict';

var path = process.cwd();
var VoteHandler = require(path + '/app/controllers/voteHandler.server.js');
var PinHandler = require(path + '/app/controllers/pinHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var voteHandler = new VoteHandler();
	var pinHandler = new PinHandler();

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

	/*
	* for Voting App
	*/
	app.route('/vote')
		.get(voteHandler.getVotes);

	app.route('/vote/new')
		.get(isLoggedIn, function (req, res) {
			res.render(path + '/public/vote/new', { 'user' : req.user });
		});

	app.route('/vote/add')
		.get(isLoggedIn, voteHandler.addVote);

	app.route('/vote/show/:id')
		.get(voteHandler.getVote);

	app.route('/vote/pick')
		.post(voteHandler.pickOneOption);

	app.route('/vote/delete')
		.post(isLoggedIn, voteHandler.deleteVote);

	app.route('/vote/my')
		.get(isLoggedIn, voteHandler.getMyVotes);

	// for db check
	app.route('/vote/dbcheck/get/:schema')
		.get(voteHandler.DBCheckGet);

	app.route('/vote/dbcheck/remove/:schema')
		.get(voteHandler.DBCheckDeleteAll);


	/*
	* for Pinterest Clone
	*/
	app.route('/pin')
		.get(pinHandler.getPins);

	app.route('/pin/add')
		.post(isLoggedIn, pinHandler.addPin);

	// for db check
	app.route('/pin/dbcheck/get/:schema')
		.get(pinHandler.DBCheckGet);
};


// http://expressjs.com/ko/guide/routing.html