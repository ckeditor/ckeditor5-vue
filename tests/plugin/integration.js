/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

Vue.use( CKEditor );

describe( 'CKEditor plugin', () => {
	describe( 'Vue.use()', () => {
		it( 'should work with an actual editor build', done => {
			const domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			const wrapper = mount( {
				template: '<ckeditor :editor="editor" @ready="onReady()" v-model="editorData"></ckeditor>',
				methods: {
					onReady: () => {
						const instance = wrapper.vm.$children[ 0 ].$_instance;

						expect( instance ).to.be.instanceOf( ClassicEditor );
						expect( instance.getData() ).to.equal( '<p>foo</p>' );

						wrapper.destroy();
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
				}
			} );
		} );
	} );
} );
