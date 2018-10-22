/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

Vue.use( CKEditor, {
	editors: {
		classic: ClassicEditor
	}
} );

describe( 'CKEditor plugin', () => {
	it( 'works with an actual editor build', done => {
		const wrapper = mount( {
			template: '<ckeditor editor="classic" @ready="onReady()" v-model="editorData"></ckeditor>',
			methods: {
				onReady: () => {
					const instance = wrapper.vm.$children[ 0 ].instance;

					expect( instance ).to.be.instanceOf( ClassicEditor );
					expect( instance.getData() ).to.equal( '<p>foo</p>' );

					wrapper.destroy();
					done();
				}
			}
		}, {
			attachToDocument: true,
			data: () => {
				return {
					editorData: '<p>foo</p>'
				};
			}
		} );
	} );
} );
