'use strict';

var Votes = require('../models/votes.js');
var Picks = require('../models/picks.js');

function VoteHandler () {

	this.getVotes = function (req, res) {
		Votes
		.find()
		.exec(function (err, result) {
			if (err) { throw err; }

			//res.json(result);
			//console.log(result);
			res.render(process.cwd() + '/public/vote/index', { data : result, user : req.user });
		});
	};


	this.addVote = function (req, res) {
		//console.log(req.query);

		var options = [];
		req.query.options.split(",")
			.map(function(item) {
				return item.trim();
			}).forEach(function(name) {
				options.push({name: name, count: 0});
			});

		//console.log(options);

		Votes
		.create({vote: { title : req.query.title,
					  options : options,
					  author : req.query.author
		}}, function (err, result) {
			if (err) { res.json(err); }

			res.redirect('/');
		});
	};


	this.getVote = function (req, res) {

		Votes
		.findOne({ _id : req.params.id })
		.exec(function (err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/vote/show', { data : result, user : req.user });
		});
	};


	this.pickOneOption = function (req, res) {
		//Picks.find({'pick.vote_id':req.body.id}).exec(function(err, result) {console.log(result)})

		// check whether user voted
		if (req.user) {
			Picks
			.find({ 'pick.vote_id': req.body.id, 'pick.user_id': req.user._id })
			.exec(function(err, result) {
				if (err) {throw err;}
				if (result.length != 0) {
					res.status(500).send({error: '50000[user-voted]: You can only vote once a poll.'});
					return;
				}
				saveNewPick();
			});
		} else {
			Picks
			.find({ 'pick.vote_id': req.body.id, 'pick.ip': req.connection.remoteAddress })
			.exec(function(err, result) {
				if (err) {throw err;}
				if (result.length != 0) {
					res.status(500).send({error: '50001[ip-voted]: You can only vote once a poll.'});
					return;
				}
				saveNewPick();
			});
		}


		function saveNewPick() {
			var data = {
				user_id: req.user? req.user._id : null,
				option_id: req.body.option,
				vote_id : req.body.id,
				ip: req.connection.remoteAddress
			};

			Picks
			.create({pick : data}, function(err, newPick) {
				if (err) { res.json(err); }

				// after new pick saved, update vote
				Votes
				.findOneAndUpdate(
					{_id : req.body.id, 'vote.options._id' : req.body.option},
					{$inc : {'vote.options.$.count' : 1}, $push : {'vote.picks' : newPick}},
					{new: true})
				.exec(function (err, result2) {
					if (err) {throw err;}
					res.json(result2);
				});
			});
		}

	};// end pickOneOption


	this.deleteVote = function (req, res) {
		Picks
		.remove({ 'pick.vote_id' : req.body.id })
		.exec(function(err, result) {
			if (err) { throw err; }

			Votes
			.remove({ _id : req.body.id, 'vote.author' : req.body.author })
			.exec(function (err2, result2) {
				if (err2) { throw err2; }

				res.redirect('/');
			});
		});
	};


	this.getMyVotes = function (req, res) {
		Votes
		.find({ 'vote.author' : req.user._id })
		.exec(function (err, result) {
			if (err) { throw err; }

			res.render(process.cwd() + '/public/vote/my', { data : result, user : req.user });
		});
	};



	// for db check
	this.DBCheckGet = function(req, res) {
		var schema = req.params.schema;
		switch (schema) {
			case 'votes':
				Votes.find().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
			case 'picks':
				Picks.find().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
		}
	};

	this.DBCheckDeleteAll = function(req, res) {
		var schema = req.params.schema;
		switch (schema) {
			case 'votes':
				Votes.remove().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
			case 'picks':
				Picks.remove().exec(function(err, result) {
					if (err) { throw err; }
					return res.json(result);
				});
				break;
		}
	};

}

module.exports = VoteHandler;


// https://docs.mongodb.com/manual/reference/method/db.collection.insert/