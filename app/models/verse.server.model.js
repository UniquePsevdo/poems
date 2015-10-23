'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Verse Schema
 */
var VerseSchema = new Schema({
	poem_name: {
		type: String,
		default: '',
		required: 'Please fill verse name',
		trim: true
	},
	poem: [{line: String, line_index: Number, line_sound_buffer: [Number], line_duration: Number}]
	,
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

/*
 poem_name: String,
 poem: [{line: String, line_sound_buffer: [Number]}],
 user: {type: Schema.ObjectId, ref: 'User'}
 */

mongoose.model('Verse', VerseSchema);
