'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
	vote: {
		_id: mongoose.Schema.Types.ObjectId,
		title: String,
		options: [{name: String, count: Number}],
		date_created: Date,
		date_updated: Date,
		author: String,
		picks: [mongoose.Schema.Types.ObjectId]
	}
});

module.exports = mongoose.model('Vote', Vote);
