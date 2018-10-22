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

Vue.use( CKEditor, {
	editors: {
		foo: FooEditor,
		bar: BarEditor
	}
} );

describe( 'CKEditor plugin', () => {
	it( 'works with different kinds of editors', done => {
		const wrapperFoo = mount( {
			template: '<ckeditor editor="foo"></ckeditor>'
		} );

		const wrapperBar = mount( {
			template: '<ckeditor editor="bar"></ckeditor>'
		} );

		Vue.nextTick( () => {
			expect( wrapperFoo.vm.$children[ 0 ].instance ).to.be.instanceOf( FooEditor );
			expect( wrapperBar.vm.$children[ 0 ].instance ).to.be.instanceOf( BarEditor );

			done();
		} );
	} );
} );
