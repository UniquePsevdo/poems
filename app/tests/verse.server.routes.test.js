'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Verse = mongoose.model('Verse'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, verse;

/**
 * Verse routes tests
 */
describe('Verse CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Verse
		user.save(function() {
			verse = {
				name: 'Verse Name'
			};

			done();
		});
	});

	it('should be able to save Verse instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Verse
				agent.post('/verses')
					.send(verse)
					.expect(200)
					.end(function(verseSaveErr, verseSaveRes) {
						// Handle Verse save error
						if (verseSaveErr) done(verseSaveErr);

						// Get a list of Verses
						agent.get('/verses')
							.end(function(versesGetErr, versesGetRes) {
								// Handle Verse save error
								if (versesGetErr) done(versesGetErr);

								// Get Verses list
								var verses = versesGetRes.body;

								// Set assertions
								(verses[0].user._id).should.equal(userId);
								(verses[0].name).should.match('Verse Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Verse instance if not logged in', function(done) {
		agent.post('/verses')
			.send(verse)
			.expect(401)
			.end(function(verseSaveErr, verseSaveRes) {
				// Call the assertion callback
				done(verseSaveErr);
			});
	});

	it('should not be able to save Verse instance if no name is provided', function(done) {
		// Invalidate name field
		verse.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Verse
				agent.post('/verses')
					.send(verse)
					.expect(400)
					.end(function(verseSaveErr, verseSaveRes) {
						// Set message assertion
						(verseSaveRes.body.message).should.match('Please fill Verse name');
						
						// Handle Verse save error
						done(verseSaveErr);
					});
			});
	});

	it('should be able to update Verse instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Verse
				agent.post('/verses')
					.send(verse)
					.expect(200)
					.end(function(verseSaveErr, verseSaveRes) {
						// Handle Verse save error
						if (verseSaveErr) done(verseSaveErr);

						// Update Verse name
						verse.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Verse
						agent.put('/verses/' + verseSaveRes.body._id)
							.send(verse)
							.expect(200)
							.end(function(verseUpdateErr, verseUpdateRes) {
								// Handle Verse update error
								if (verseUpdateErr) done(verseUpdateErr);

								// Set assertions
								(verseUpdateRes.body._id).should.equal(verseSaveRes.body._id);
								(verseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Verses if not signed in', function(done) {
		// Create new Verse model instance
		var verseObj = new Verse(verse);

		// Save the Verse
		verseObj.save(function() {
			// Request Verses
			request(app).get('/verses')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Verse if not signed in', function(done) {
		// Create new Verse model instance
		var verseObj = new Verse(verse);

		// Save the Verse
		verseObj.save(function() {
			request(app).get('/verses/' + verseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', verse.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Verse instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Verse
				agent.post('/verses')
					.send(verse)
					.expect(200)
					.end(function(verseSaveErr, verseSaveRes) {
						// Handle Verse save error
						if (verseSaveErr) done(verseSaveErr);

						// Delete existing Verse
						agent.delete('/verses/' + verseSaveRes.body._id)
							.send(verse)
							.expect(200)
							.end(function(verseDeleteErr, verseDeleteRes) {
								// Handle Verse error error
								if (verseDeleteErr) done(verseDeleteErr);

								// Set assertions
								(verseDeleteRes.body._id).should.equal(verseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Verse instance if not signed in', function(done) {
		// Set Verse user 
		verse.user = user;

		// Create new Verse model instance
		var verseObj = new Verse(verse);

		// Save the Verse
		verseObj.save(function() {
			// Try deleting Verse
			request(app).delete('/verses/' + verseObj._id)
			.expect(401)
			.end(function(verseDeleteErr, verseDeleteRes) {
				// Set message assertion
				(verseDeleteRes.body.message).should.match('User is not logged in');

				// Handle Verse error error
				done(verseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Verse.remove().exec();
		done();
	});
});