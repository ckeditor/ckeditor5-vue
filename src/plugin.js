/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console */

import { version } from 'vue';
import CKEditorComponent from './ckeditor.js';

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

/**
 * Checks if CKEditor plugin supports currently installed Vue. This plugin supports only Vue 3.x.
 * The CKEditor plugin for Vue 2.x can be found on https://github.com/ckeditor/ckeditor5-vue2.
 *
 * @param {string} version Current version of the Vue framework.
 */
function isVueSupported( version ) {
	const currentVersion = parseInt( version );
	const isSupported = currentVersion >= 2;
	const isSupportedByThisRepo = currentVersion >= 3;

	if ( !isSupportedByThisRepo ) {
		console.warn( 'This CKEditor plugin supports only Vue 3.x.' );

		if ( isSupported ) {
			console.warn(
				`For Vue ${ version }, which you have currently installed, please visit https://github.com/ckeditor/ckeditor5-vue2.`
			);
		}
	}

	return isSupportedByThisRepo;
}

export default isVueSupported( version ) ? CKEditor : {};
