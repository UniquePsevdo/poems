'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verse = mongoose.model('Verse'),
	_ = require('lodash');

/**
 * Create a Verse
 */
exports.create = function(req, res) {
	var verse = new Verse(req.body);
	verse.user = req.user;

	verse.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verse);
			// добавить сюда socket emit
		}
	});
};

/**
 * Show the current Verse
 */
exports.read = function(req, res) {
	res.jsonp(req.verse);
};

/**
 * Update a Verse
 */
exports.update = function(req, res) {
	var verse = req.verse ;

	verse = _.extend(verse , req.body);

	verse.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verse);
		}
	});
};

/**
 * Delete an Verse
 */
exports.delete = function(req, res) {
	var verse = req.verse ;

	verse.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verse);
		}
	});
};

/**
 * List of Verses
 */
exports.list = function(req, res) { 
	Verse.find().sort('-created').populate('user', 'displayName').exec(function(err, verses) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(verses);
		}
	});
};

/**
 * Verse middleware
 */
exports.verseByID = function(req, res, next, id) { 
	Verse.findById(id).populate('user', 'displayName').exec(function(err, verse) {
		if (err) return next(err);
		if (! verse) return next(new Error('Failed to load Verse ' + id));
		req.verse = verse ;
		next();
	});
};

/**
 * Verse authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.verse.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
