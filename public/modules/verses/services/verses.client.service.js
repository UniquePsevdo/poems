'use strict';

//Verses service used to communicate Verses REST endpoints
angular.module('verses').factory('Verses', ['$resource',
	function($resource) {
		return $resource('verses/:verseId', { verseId: '@_id'},
			{
				update: { method: 'PUT'}
		});
	}
]);
