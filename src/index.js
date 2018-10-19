/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorComponent from './ckeditor.js'

const CKEditor = {
	install( Vue, { componentName = 'ckeditor', editors = {} } = {} ) {
		const component = Vue.component( componentName, CKEditorComponent );

		component.prototype._editorTypes = editors;
	}
};

export default CKEditor;