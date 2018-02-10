'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
	pin: {
		author: mongoose.Schema.Types.ObjectId,
		description: String,
		imgPath: String,
		likes: [mongoose.Schema.Types.ObjectId] //user id
	}
});

module.exports = mongoose.model('Pin', Pin);
