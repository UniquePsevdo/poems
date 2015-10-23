'use strict';

(function() {
	// Verses Controller Spec
	describe('Verses Controller Tests', function() {
		// Initialize global variables
		var VersesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Verses controller.
			VersesController = $controller('VersesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Verse object fetched from XHR', inject(function(Verses) {
			// Create sample Verse using the Verses service
			var sampleVerse = new Verses({
				name: 'New Verse'
			});

			// Create a sample Verses array that includes the new Verse
			var sampleVerses = [sampleVerse];

			// Set GET response
			$httpBackend.expectGET('verses').respond(sampleVerses);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.verses).toEqualData(sampleVerses);
		}));

		it('$scope.findOne() should create an array with one Verse object fetched from XHR using a verseId URL parameter', inject(function(Verses) {
			// Define a sample Verse object
			var sampleVerse = new Verses({
				name: 'New Verse'
			});

			// Set the URL parameter
			$stateParams.verseId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/verses\/([0-9a-fA-F]{24})$/).respond(sampleVerse);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.verse).toEqualData(sampleVerse);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Verses) {
			// Create a sample Verse object
			var sampleVersePostData = new Verses({
				name: 'New Verse'
			});

			// Create a sample Verse response
			var sampleVerseResponse = new Verses({
				_id: '525cf20451979dea2c000001',
				name: 'New Verse'
			});

			// Fixture mock form input values
			scope.name = 'New Verse';

			// Set POST response
			$httpBackend.expectPOST('verses', sampleVersePostData).respond(sampleVerseResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Verse was created
			expect($location.path()).toBe('/verses/' + sampleVerseResponse._id);
		}));

		it('$scope.update() should update a valid Verse', inject(function(Verses) {
			// Define a sample Verse put data
			var sampleVersePutData = new Verses({
				_id: '525cf20451979dea2c000001',
				name: 'New Verse'
			});

			// Mock Verse in scope
			scope.verse = sampleVersePutData;

			// Set PUT response
			$httpBackend.expectPUT(/verses\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/verses/' + sampleVersePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid verseId and remove the Verse from the scope', inject(function(Verses) {
			// Create new Verse object
			var sampleVerse = new Verses({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Verses array and include the Verse
			scope.verses = [sampleVerse];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/verses\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleVerse);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.verses.length).toBe(0);
		}));
	});
}());