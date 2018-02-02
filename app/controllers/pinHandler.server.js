'use strict';

var Pins = require('../models/pins.js');

function PinHandler () {

	this.getPins = function (req, res) {
		Pins
		.find()
		.exec(function (err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/pin/index', { data : result, user : req.user });
		});
	};

	this.getMyPins = function (req, res) {
		Pins
		.find({ 'pin.author' : req.user._id })
		.exec(function (err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/pin/my', { data : result, user : req.user });
		});
	};

	this.addPin = function(req, res, next) {
		Pins
		.create({pin: {
			author: req.user._id,
			description: req.body.description,
			imgPath: req.file.filename
		}}, function (err, result) {
			if (err) { res.json(err); }

			res.redirect('/pin');
		});
	};

	this.deletePin = function (req, res) {
		Pins
		.remove({ 'pin._id' : req.body.id })
		.exec(function(err, result) {
			if (err) { throw err; }

			res.redirect('/pin');
		});
	};


	this.likePin = function (req, res) {
		if (req.user) {
			Pins
			.find({ 'pin._id': req.body.id, 'pin.likes.user_id': req.user._id })
			.exec(function(err, result) {
				if (err) {throw err;}

				console.log(result);

				// if (result.length != 0) {
				// 	// if user clicked like already, unlike

				// } else {
				// 	// save new like
				// }

			});
		} else {

		}
	};

	// for db check
	this.DBCheckGet = function(req, res) {
		var schema = req.params.schema;
		switch (schema) {
			case 'pins':
				Pins.find().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
		}
	};

	this.DBCheckDeleteAll = function(req, res) {
		var schema = req.params.schema;
		switch (schema) {
			case 'pins':
				Pins.remove().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
		}
	};

}

module.exports = PinHandler;