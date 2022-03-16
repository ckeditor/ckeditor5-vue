/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import { MockEditor } from '../_utils/mockeditor';

class FooEditor extends MockEditor {}
class BarEditor extends MockEditor {}

describe( 'CKEditor plugin', () => {
	it( 'should work when the component is used locally', async () => {
		const wrapperFoo = mount( {
			template: '<ckeditor ref="ckeditor-foo" :editor="editorType"></ckeditor>',
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
			template: '<ckeditor ref="ckeditor-bar" :editor="editorType"></ckeditor>',
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

		await nextTick();

		const instanceFoo = wrapperFoo.findComponent( { ref: 'ckeditor-foo' } ).vm.instance;
		const instanceBar = wrapperBar.findComponent( { ref: 'ckeditor-bar' } ).vm.instance;

		expect( instanceFoo ).to.be.instanceOf( FooEditor );
		expect( instanceBar ).to.be.instanceOf( BarEditor );

		wrapperFoo.unmount();
		wrapperBar.unmount();
	} );
} );
