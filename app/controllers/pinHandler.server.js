'use strict';

var Pins = require('../models/pins.js');

function PinHandler () {

	this.getPins = function (req, res) {
		res.render(process.cwd() + '/public/pin/index', { data : "Hi", user : req.user });
	};

	this.addPin = function(req, res) {
		Pins
		.create({pin: {
			user_id: req.user._id,
			description: req.body.description,
			imgPath: req.body.imgPath
		}}, function (err, result) {
			if (err) { res.json(err); }

			res.redirect('/pin');
		});
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

}

module.exports = PinHandler;