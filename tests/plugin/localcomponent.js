/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import { MockEditor } from '../_utils/mockeditor';
import waitForEditorToBeReady from '../_utils/waitforeditortobeready';

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

		await waitForEditorToBeReady();

		const instanceFoo = wrapperFoo.findComponent( { ref: 'ckeditor-foo' } ).vm.getEditor();
		const instanceBar = wrapperBar.findComponent( { ref: 'ckeditor-bar' } ).vm.getEditor();

		expect( instanceFoo ).to.be.instanceOf( FooEditor );
		expect( instanceBar ).to.be.instanceOf( BarEditor );

		wrapperFoo.unmount();
		wrapperBar.unmount();
	} );
} );
