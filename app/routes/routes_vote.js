'use strict';

var path = process.cwd();
var VoteHandler = require(path + '/app/controllers/voteHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/facebook');
		}
	}

	var voteHandler = new VoteHandler();

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

};