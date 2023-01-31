/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */
import * as Vue from 'vue';
import CKEditorComponent from './ckeditor.js';

const [ major ] = getVueVersion().split( '.' ).map( i => parseInt( i, 10 ) );

/* istanbul ignore if */
if ( major < 3 ) {
	throw new Error(
		'The CKEditor plugin works only with Vue 3+. ' +
		'For more information, please refer to ' +
		'https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html'
	);
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

/* istanbul ignore next */
function getVueVersion() {
	// Vue 3+.
	if ( Vue.version ) {
		return Vue.version;
	}

	// Webpack complains if the `Vue.default` does not exist. It is exported by Vue 2.
	// export 'default' (imported as 'Vue') was not found in 'vue'
	const DEFAULT_KEY = 'default';

	if ( Vue[ DEFAULT_KEY ] ) {
		return Vue[ DEFAULT_KEY ].version;
	}
}
