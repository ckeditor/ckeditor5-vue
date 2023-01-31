/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import waitForEditorToBeReady from '../_utils/waitforeditortobeready';

describe( 'CKEditor plugin', () => {
	describe( 'Plugin installed globally', () => {
		it( 'should work with an actual editor build', done => {
			const domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			const wrapper = mount( {
				template: '<ckeditor :editor="editor" @ready="onReady" v-model="editorData"></ckeditor>',
				methods: {
					onReady: async () => {
						await waitForEditorToBeReady();

						const instance = wrapper.findComponent( { name: 'ckeditor' } ).vm.getEditor();

						expect( instance ).to.be.instanceOf( ClassicEditor );
						expect( instance.getData() ).to.equal( '<p>foo</p>' );

						wrapper.unmount();
						done();
					}
				}
			}, {
				attachTo: domElement,
				data: () => {
					return {
						editor: ClassicEditor,
						editorData: '<p>foo</p>'
					};
				},
				global: {
					plugins: [ CKEditor ]
				}
			} );
		} );
	} );
} );
