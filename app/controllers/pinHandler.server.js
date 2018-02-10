'use strict';

var Pins = require('../models/pins.js');
var Comments = require('../models/comments.js');
var fs = require('fs');
var mongoose = require('mongoose');

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

	this.getPinDetail = function(req, res, next) {
		// Pins
		// .find({ _id : req.params.id })
		// .exec(function (err, result) {
		// 	if (err) { throw err; }

		// 	res.render(process.cwd() + '/public/pin/detail', { data : result, user : req.user });
		// });

		var id = mongoose.Types.ObjectId(req.params.id);

		Pins.aggregate([
			{$match: { '_id': id }},
			{$lookup: {
				from: "users",
				localField: "pin.author",
				foreignField: "_id",
				as: "pin.author"
			}}
		], function(err, result) {
			if (err) { throw err; }

			res.locals.detail = result[0];
			next();
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
			.find({ '_id': req.query.id, 'pin.likes': req.user._id })
			.exec(function(err, result) {
				if (err) { throw err; }

				if (result.length != 0) {
					// if user clicked like already, unlike
					Pins
					.findOneAndUpdate(
						{'_id' : req.query.id},
						{$pull : {'pin.likes' : req.user._id}},
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
						{$push: {'pin.likes' : req.user._id}},
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

	this.addComment = function(req, res) {
		var order = 0;

		if (req.body.parent) {
			// find last child comment's order, increase all next comments's order, and add new comment next.
			// ex) 1, [new 2!] 2(->3), 3(->4), ....

			Comments
			.aggregate([
				{$match: { 'comment.article_id': mongoose.Types.ObjectId(req.body.article),
						 'comment.parent': mongoose.Types.ObjectId(req.body.parent) }},
				{$sort: {'comment.date': -1}},
				{$limit: 1}
			], function(err, result) {
				if (err) { throw err; }

				if (result.length != 0) {
					order = result[0].comment.order + 1;
					increaseOrder(order);
				} else {
					Comments
					.findOne({'_id': mongoose.Types.ObjectId(req.body.parent)})
					.exec(function(err, result) {
						if (err) { throw err; }

						order = result.comment.order;
						increaseOrder(order + 1);
					});
				}
			});
		} else {
			// if the new comment is not child, just add it to the end of comment array.
			Comments
			.count(
				{'comment.article_id': mongoose.Types.ObjectId(req.body.article)},
			function(err, result) {
				if (err) { throw err;}

				createComment(result + 1);
			});
		}

		function increaseOrder(order) {
			Comments
			.updateMany(
				{ 'comment.order': {$gte: order}, 'comment.article_id': mongoose.Types.ObjectId(req.body.article) },
				{ $inc: {'comment.order': 1} })
			.exec(function(err, result) {
				if (err) {throw err;}

				createComment(order);
			});
		}

		function createComment(order) {
			Comments
			.create({comment: {
				article_id: req.body.article,
				parent: (req.body.parent? req.body.parent : null),
				depth: (req.body.parent? 1 : 0),
				order: order,
				author: req.user._id,
				content: req.body.content,
				date: new Date()
			}}, function (err, result) {
				if (err) { res.json(err); }

				res.redirect(req.headers.referer);
			});
		}

	};

	this.getComments = function (req, res) {
		Comments
		.aggregate([
			{$match: { 'comment.article_id': mongoose.Types.ObjectId(req.params.id) }},
			{$sort: {'comment.order' : 1}},
			{$lookup: {
				from: "users",
				localField: "comment.author",
				foreignField: "_id",
				as: "comment.author"
			}}
		], function(err, result) {
			if (err) { throw err; }

			var data = res.locals.detail;
			data.comments = result;

			res.render(process.cwd() + '/public/pin/detail', { data : data, user : req.user });
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
			case 'comments':
				Comments.find().exec(function(err, result) {
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
			case 'comments':
				Comments.remove().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
		}
	};

}

module.exports = PinHandler;