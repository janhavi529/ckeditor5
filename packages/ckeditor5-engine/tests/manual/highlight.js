/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window, document */

import ModelRange from '../../src/model/range';
import ViewPosition from '../../src/view/position';

import {
	upcastElementToElement,
} from '../../src/conversion/upcast-converters';

import {
	downcastElementToElement,
	downcastMarkerToHighlight
} from '../../src/conversion/downcast-converters';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

class FancyWidget extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// Configure schema.
		schema.register( 'fancywidget', {
			isObject: true
		} );
		schema.extend( 'fancywidget', { allowIn: '$root' } );

		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'fancywidget',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = viewWriter.createContainerElement( 'figure', { class: 'fancy-widget' } );
				viewWriter.insert( ViewPosition.createAt( widgetElement ), viewWriter.createText( 'widget' ) );

				return toWidget( widgetElement, viewWriter );
			}
		} ) );

		conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: 'figure',
				model: 'fancywidget'
			} ) );
	}
}

ClassicEditor.create( global.document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic, List, FancyWidget ],
	toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ]
} )
	.then( editor => {
		window.editor = editor;

		editor.conversion.for( 'editingDowncast' ).add( downcastMarkerToHighlight( {
			model: 'marker',
			view: data => ( {
				class: 'highlight-' + data.markerName.split( ':' )[ 1 ]
			} )
		} ) );

		document.getElementById( 'add-marker-yellow' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'yellow' );
			evt.preventDefault();
		} );

		document.getElementById( 'add-marker-blue' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'blue' );
			evt.preventDefault();
		} );

		document.getElementById( 'add-marker-red' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'red' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-yellow' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'yellow' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-blue' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'blue' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-red' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'red' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-markers' ).addEventListener( 'mousedown', evt => {
			const markers = editor.model.markers;

			editor.model.change( writer => {
				for ( const marker of markers ) {
					writer.removeMarker( marker );
				}
			} );

			evt.preventDefault();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function addMarker( editor, color ) {
	editor.model.change( writer => {
		const range = ModelRange.createFromRange( editor.model.document.selection.getFirstRange() );
		writer.setMarker( 'marker:' + color, range );
	} );
}

function removeMarker( editor, color ) {
	editor.model.change( writer => {
		writer.removeMarker( 'marker:' + color );
	} );
}
