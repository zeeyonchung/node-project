'use strict';

var Votes = require('../models/votes.js');

function VoteHandler () {
          
          this.getVotes = function (req, res) {
		Votes
		.find()
		.exec(function (err, result) {
			if (err) { throw err; }

			//res.json(result);
			//console.log(result)
			res.render(process.cwd() + '/public/vote/index', { data : result });
		});
	};


          
		
	this.addVote = function (req, res) {
	          //console.log(req.query)
		
		Votes
		.create({vote: { title : req.query.title,
          		      options : req.query.options.split(","),
          		      author : req.query.author
		}}, function (err, result) {
			if (err) { res.json(err); }

			res.redirect('/');
		});
	};

}

module.exports = VoteHandler;


// https://docs.mongodb.com/manual/reference/method/db.collection.insert/