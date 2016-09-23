chrome.devtools.panels.elements.createSidebarPane( "Triggers", function(sidebar) {

	sidebar.setPage( 'sidebar.html' );
	sidebar.setHeight( '100vh' );
	sidebar.onShown.addListener( function() {
	} );
	chrome.runtime.sendMessage({"message": "open_new_tab" });

});
