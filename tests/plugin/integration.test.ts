/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import { CkeditorPlugin } from '../../src/plugin.js';

describe( 'CKEditor plugin', () => {
	it( 'should work with an actual editor build', async () => {
		class TestEditor extends ClassicEditor {
			public static builtinPlugins = [
				Essentials,
				Paragraph
			];

			public static defaultConfig = {
				toolbar: {
					items: [ 'undo', 'redo' ]
				}
			};
		}

		const domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		let instance: TestEditor | null = null;

		const wrapper = mount(
			{
				template: '<ckeditor v-model="data" :editor="editor" @ready="onReady" />',
				methods: {
					onReady( editor: TestEditor ) {
						instance = editor;
					}
				}
			},
			{
				attachTo: domElement,
				global: {
					plugins: [ CkeditorPlugin ]
				},
				data: () => ( {
					editor: TestEditor,
					data: '<p>foo</p>'
				} )
			}
		);

		await vi.waitUntil( () => document.querySelector( '.ck-editor' ), { timeout: 500 } );

		expect( instance ).toBeInstanceOf( TestEditor );
		expect( instance!.getData() ).toBe( '<p>foo</p>' );

		wrapper.unmount();
	} );
} );
