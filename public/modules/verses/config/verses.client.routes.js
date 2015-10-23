'use strict';

//Setting up route
angular.module('verses').config(['$stateProvider',
	function($stateProvider) {
		// Verses state routing
		$stateProvider.
		state('listVerses', {
			url: '/verses',
			templateUrl: 'modules/verses/views/list-verses.client.view.html'
		}).
		state('createVerse', {
			url: '/verses/create',
			templateUrl: 'modules/verses/views/create-verse.client.view.html'
		}).
		state('viewVerse', {
			url: '/verses/:verseId',
			templateUrl: 'modules/verses/views/view-verse.client.view.html'
		}).
		state('editVerse', {
			url: '/verses/:verseId/edit',
			templateUrl: 'modules/verses/views/edit-verse.client.view.html'
		});
	}
]);