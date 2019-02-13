/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorComponent from './ckeditor.js';

const CKEditor = {
	/**
	 * Instals the plugin, registering the `<ckeditor>` component.
	 *
	 * @param {Vue} Vue The Vue object.
	 */
	install( Vue ) {
		Vue.component( 'ckeditor', CKEditorComponent );
	},
	component: CKEditorComponent
};

export default CKEditor;
