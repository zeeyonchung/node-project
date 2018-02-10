'use strict';

var path = process.cwd();
var PinHandler = require(path + '/app/controllers/pinHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/facebook');
		}
	}

	var pinHandler = new PinHandler();

	app.route('/pin')
		.get(pinHandler.getPins);

	app.route('/pin/my')
		.get(isLoggedIn, pinHandler.getMyPins);

	app.route('/pin/add')
		.post(isLoggedIn, pinHandler.addPin);

	app.route('/pin/delete')
		.post(isLoggedIn, pinHandler.deletePin);

	app.route('/pin/like')
		.get(isLoggedIn, pinHandler.likePin);

	app.route('/pin/detail/:id')
		.get(pinHandler.getPinDetail, pinHandler.getComments);

	app.route('/pin/comment/add')
		.post(isLoggedIn, pinHandler.addComment);

	// for db check
	app.route('/pin/dbcheck/get/:schema')
		.get(pinHandler.DBCheckGet);

	app.route('/pin/dbcheck/remove/:schema')
		.get(pinHandler.DBCheckDeleteAll);

};