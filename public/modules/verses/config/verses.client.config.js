'use strict';

// Configuring the Articles module
angular.module('verses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Verses', 'verses', 'dropdown', '/verses(/create)?');
		Menus.addSubMenuItem('topbar', 'verses', 'List Verses', 'verses');
		Menus.addSubMenuItem('topbar', 'verses', 'New Verse', 'verses/create');
	}
]);