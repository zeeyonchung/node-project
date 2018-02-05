'use strict';

var Pins = require('../models/pins.js');
var fs = require('fs');

function PinHandler () {

	this.getPins = function (req, res) {
		// Pins
		// .find()
		// .exec(function (err, result) {
		// 	if (err) { throw err; }

		// 	res.render(process.cwd() + '/public/pin/index', { data : result, user : req.user });
		// });

		Pins.aggregate([
			{$lookup: {
				from: "users",
				localField: "pin.author",
				foreignField: "_id",
				as: "pin.author"
			}}
		], function(err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/pin/index', { data : result, user : req.user });
		});
	};

	this.getMyPins = function (req, res) {
		// Pins
		// .find({ 'pin.author' : req.user._id })
		// .exec(function (err, result) {
		// 	if (err) { throw err; }

		// 	res.render(process.cwd() + '/public/pin/index', { data : result, user : req.user });
		// });

		Pins.aggregate([
			{$match: { 'pin.author': req.user._id }},
			{$lookup: {
				from: "users",
				localField: "pin.author",
				foreignField: "_id",
				as: "pin.author"
			}}
		], function(err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/pin/index', { data : result, user : req.user });
		});
	};

	this.getPinDetail = function(req, res) {
		Pins
		.find({ _id : req.params.id })
		.exec(function (err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/pin/detail', { data : result, user : req.user });
		});
	};

	this.addPin = function(req, res) {
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
		// Pins
		// .remove({ _id : req.body.id })
		// .exec(function(err, result) {
		// 	if (err) { throw err; }

		//	res.redirect('/pin');
		// });

		Pins
		.findOneAndRemove({ _id : req.body.id })
		.exec(function(err, result) {
			if (err) { throw err; }

			// delete image file
			try {
				fs.unlinkSync(process.cwd() + '/uploads/' + result.pin.imgPath);
			} catch (err2) {
				throw err2;
			}

			res.redirect('/pin');
		});
	};


	this.likePin = function (req, res) {
		if (req.user) {
			Pins
			.find({ '_id': req.query.id, 'pin.likes.user_id': req.user._id })
			.exec(function(err, result) {
				if (err) { throw err; }

				if (result.length != 0) {
					// if user clicked like already, unlike
					Pins
					.findOneAndUpdate(
						{'_id' : req.query.id},
						{$pull : {'pin.likes' : {'user_id' : req.user._id}}},
						{new : true})
					.exec(function(err, result) {
						if (err) { throw err; }

						res.end();
					});

				} else {
					// save new like
					Pins
					.findOneAndUpdate(
						{'_id' : req.query.id},
						{$push: {'pin.likes' : {'user_id' : req.user._id}}},
						{new : true})
					.exec(function(err, result) {
						if (err) { throw err; }

						res.end();
					});
				}

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