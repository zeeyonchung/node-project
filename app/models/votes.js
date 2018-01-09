'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
	vote: {
	          title: String,
	          options: [],
	          date_created: Date,
	          date_updated: Date,
	          author: String,
	          _id: mongoose.Schema.Types.ObjectId
	}
});

module.exports = mongoose.model('Vote', Vote);
