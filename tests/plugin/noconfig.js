/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import MockEditor from '../_utils/mockeditor';

class FooEditor extends MockEditor {}
class BarEditor extends MockEditor {}

Vue.use( CKEditor );

describe( 'CKEditor plugin', () => {
	describe( 'Vue.use()', () => {
		it( 'works without configuration (editor constructor provided by view)', done => {
			const wrapperFoo = mount( {
				template: '<ckeditor :editor="editorType"></ckeditor>'
			}, {
				data: () => {
					return {
						editorType: FooEditor
					};
				}
			} );

			const wrapperBar = mount( {
				template: '<ckeditor :editor="editorType"></ckeditor>'
			}, {
				data: () => {
					return {
						editorType: BarEditor
					};
				}
			} );

			Vue.nextTick( () => {
				expect( wrapperFoo.vm.$children[ 0 ].instance ).to.be.instanceOf( FooEditor );
				expect( wrapperBar.vm.$children[ 0 ].instance ).to.be.instanceOf( BarEditor );

				done();
			} );
		} );
	} );
} );
