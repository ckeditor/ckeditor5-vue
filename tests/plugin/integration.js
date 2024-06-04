/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { mount } from '@vue/test-utils';
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import CKEditor from '../../src/plugin';

describe( 'CKEditor plugin', () => {
	it( 'should work with an actual editor build', done => {
		class TestEditor extends ClassicEditor {
			static builtinPlugins = [
				Essentials,
				Paragraph
			];

			static defaultConfig = {
				toolbar: {
					items: [ 'undo', 'redo' ]
				}
			};
		}

		const domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		const wrapper = mount(
			{
				template: `
					<ckeditor
						v-model="data"
						:editor="editor"
						@ready="onReady"
					/>
				`,
				methods: {
					onReady( editor ) {
						expect( editor ).to.be.instanceOf( TestEditor );
						expect( editor.getData() ).to.equal( '<p>foo</p>' );

						wrapper.unmount();
						done();
					}
				}
			},
			{
				attachTo: domElement,
				global: {
					plugins: [ CKEditor ]
				},
				data() {
					return {
						editor: TestEditor,
						data: '<p>foo</p>'
					};
				}
			}
		);
	} );
} );
