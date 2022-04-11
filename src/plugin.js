/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */

import Vue, { version as vueVersion } from 'vue';
import CKEditorComponent from './ckeditor.js';

/* istanbul ignore next */
const version = Vue ? Vue.version : vueVersion;
const [ major ] = version.split( '.' ).map( i => parseInt( i, 10 ) );

/* istanbul ignore if */
if ( major < 3 ) {
	throw new Error(
		'The CKEditor plugin works only with Vue 3+. ' +
		'For more information, please refer to ' +
		'https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html'
	);
}

const { CKEDITOR_VERSION } = window;

// Starting from v34.0.0, CKEditor 5 introduces a lock mechanism enabling/disabling the read-only mode.
// As it is a breaking change between major releases of the integration, the component requires using
// CKEditor 5 in version 34 or higher.
if ( CKEDITOR_VERSION ) {
	const [ major ] = CKEDITOR_VERSION.split( '.' ).map( Number );

	if ( major < 34 ) {
		console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 34 or higher.' );
	}
} else {
	console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
}

const CKEditor = {
	/**
	 * Installs the plugin, registering the `<ckeditor>` component.
	 *
	 * @param {Vue} app The application instance.
	 */
	install( app ) {
		app.component( 'ckeditor', CKEditorComponent );
	},
	component: CKEditorComponent
};

export default CKEditor;
