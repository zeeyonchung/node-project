'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
	pin: {
		_id: mongoose.Schema.Types.ObjectId,
		author: mongoose.Schema.Types.ObjectId,
		description: String,
		imgPath: String,
		likes: [{user_id: mongoose.Schema.Types.ObjectId}]
	}
});

module.exports = mongoose.model('Pin', Pin);
