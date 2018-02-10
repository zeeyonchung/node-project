'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pick = new Schema({
	pick: {
		user_id: mongoose.Schema.Types.ObjectId,
		option_id: mongoose.Schema.Types.ObjectId,
		vote_id: mongoose.Schema.Types.ObjectId,
		ip: String
	}
});

module.exports = mongoose.model('Pick', Pick);