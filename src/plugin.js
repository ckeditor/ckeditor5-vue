/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorComponent from './ckeditor.js'

const CKEditor = {
	install( Vue, config ) {
		Vue.component( config.componentName || 'ckeditor', CKEditorComponent );

		Vue.prototype.$_ckeditor_types = config.editors;
	}
};

export default CKEditor;
