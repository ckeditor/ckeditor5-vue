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
		let fooInstance = null;
		let barInstance = null;

		// Wrapper Foo
		mount( {
			template: '<ckeditor :editor="editorType" @ready="storeInstance"></ckeditor>',
			components: {
				ckeditor: CKEditor.component
			},
			methods: {
				storeInstance( instance ) {
					fooInstance = instance;
				}
			}
		}, {
			data: () => {
				return {
					editorType: FooEditor
				};
			}
		} );

		// Wrapper Bar
		mount( {
			template: '<ckeditor :editor="editorType" @ready="storeInstance"></ckeditor>',
			components: {
				ckeditor: CKEditor.component
			},
			methods: {
				storeInstance( instance ) {
					barInstance = instance;
				}
			}
		}, {
			data: () => {
				return {
					editorType: BarEditor
				};
			}
		} );

		await Vue.nextTick();

		expect( fooInstance ).to.be.instanceOf( FooEditor );
		expect( barInstance ).to.be.instanceOf( BarEditor );
	} );
} );
