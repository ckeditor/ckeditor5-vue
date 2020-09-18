/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import { MockEditor } from '../_utils/mockeditor';

class FooEditor extends MockEditor {}
class BarEditor extends MockEditor {}

describe( 'CKEditor plugin', () => {
	it( 'should work when the component is used locally', async () => {
		const wrapperFoo = mount( {
			template: '<ckeditor :editor="editorType"></ckeditor>',
			components: {
				ckeditor: CKEditor.component
			}
		}, {
			data: () => {
				return {
					editorType: FooEditor
				};
			}
		} );

		const wrapperBar = mount( {
			template: '<ckeditor :editor="editorType"></ckeditor>',
			components: {
				ckeditor: CKEditor.component
			}
		}, {
			data: () => {
				return {
					editorType: BarEditor
				};
			}
		} );

		await Vue.nextTick();

		expect( wrapperFoo.vm.$children[ 0 ].$_instance ).to.be.instanceOf( FooEditor );
		expect( wrapperBar.vm.$children[ 0 ].$_instance ).to.be.instanceOf( BarEditor );
	} );
} );
