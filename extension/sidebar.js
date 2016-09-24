window.addEventListener( 'load', onLoad );

function onLoad() {

	var links = document.querySelectorAll( 'a[rel=external]' );
	for( var j = 0; j < links.length; j++ ) {
		var a = links[ j ];
		a.addEventListener( 'click', function( e ) {
			window.open( this.href, '_blank' );
			e.preventDefault();
		}, false );
	}

	update();

}

chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){

	update();

} );

function extractCSSAttributes( element ) {

	var computedStyles = getComputedStyle( element );
	var values = {};
	for( var j = 0; j < computedStyles.length; j++ ) {
		var property = computedStyles[ j ];
		values[ property ] = computedStyles.getPropertyValue( property );
	}

	return {
		element: element.tagName,
		values: values
	}

}

var defaultValues = new Map();
var frame = document.createElement( 'iframe' );
frame.style.display = 'none';
document.body.appendChild( frame );

function parseTriggers( triggers ) {

	var filtered = Object.keys( triggers ).filter( t => triggers[ t ] == true  );
	return JSON.stringify( filtered );

}

function update() {

	chrome.devtools.inspectedWindow.eval( '(' + extractCSSAttributes + ')( $0 )',

		function( result, isException ) {

			if( isException ) {
				document.getElementById( 'log' ).textContent = JSON.stringify( isException );
			} else {

				var res = '';

				res += `<p>${result.element}</p>`;

				var defaultStyle = defaultValues.get( result.element );
				if( !defaultStyle ) {
					var el = document.createElement( result.element );
					if( result.element === 'A' ) el.setAttribute( 'href', '#' );
					frame.contentWindow.document.body.appendChild( el );
					defaultStyle = extractCSSAttributes( el ).values;
					defaultValues.set( result.element, defaultStyle );
					frame.contentWindow.document.body.removeChild( el );
				}

				Object.keys( result.values ).forEach( property => {

					var value = result.values[ property ];
					var defaultValue = defaultStyle[ property ];

					if( value != defaultValue ) {

						var initial = data.properties[ property + '-initial' ];
						var change = data.properties[ property + '-change' ];
						if( initial || change ) {
							res += `<p><b>${property}</b><br/>${value} (<i>${defaultValue}</i>)</p>`;
						} else {
							//res += '<p>No info available </p>'
						}
						if( initial ) {
							res += `<p>Initial: ${parseTriggers( initial )}`
						}
						if( change ) {
							res += `<p>Change: ${parseTriggers( change )}`
						}

					}

				} );

				document.getElementById( 'log' ).innerHTML = res;
			}

		}

	);

}

chrome.extension.onMessage.addListener(function (msg, _, sendResponse) {
	alert(msg, _, sendResponse);
});
