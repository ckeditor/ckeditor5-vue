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
