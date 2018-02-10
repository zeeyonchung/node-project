'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comment = new Schema({
	comment: {
		article_id: mongoose.Schema.Types.ObjectId,
		parent: {type: mongoose.Schema.Types.ObjectId, required: false},
		depth: Number,
		order: Number,
		author: mongoose.Schema.Types.ObjectId,
		content: String,
		date: Date
	}
});

module.exports = mongoose.model('Comment', Comment);
