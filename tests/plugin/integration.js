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
			template: '<ckeditor editor="classic" @ready="onReady()"></ckeditor>',
			methods: {
				onReady: () => {
					expect( wrapper.vm.$children[ 0 ].instance ).to.be.instanceOf( ClassicEditor );

					Vue.nextTick( () => {
						wrapper.destroy();
						done();
					} );
				}
			}
		} );

		document.body.appendChild( wrapper.element );
	} );
} );
