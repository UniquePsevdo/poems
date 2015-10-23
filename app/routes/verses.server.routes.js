'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var verses = require('../../app/controllers/verses.server.controller');

	// Verses Routes
	app.route('/verses')
		.get(verses.list)
		.post(users.requiresLogin, verses.create);

	app.route('/verses/:verseId')
		.get(verses.read)
		.put(users.requiresLogin, verses.hasAuthorization, verses.update)
		.delete(users.requiresLogin, verses.hasAuthorization, verses.delete);

	// Finish by binding the Verse middleware
	app.param('verseId', verses.verseByID);
};
