/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cleanupOrphanEditorElements } from '../../src/utils/cleanupOrphanEditorElements.js';
import type { Editor } from 'ckeditor5';

describe( 'cleanupOrphanEditorElements', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should remove uiElement from the DOM if it is connected', () => {
		const uiElement = document.createElement( 'div' );
		document.body.appendChild( uiElement );

		const mockEditor = {
			ui: { element: uiElement }
		} as unknown as Editor;

		expect( uiElement.isConnected ).toBe( true );

		cleanupOrphanEditorElements( mockEditor );

		expect( uiElement.isConnected ).toBe( false );
	} );

	it( 'should not throw an error if uiElement is not connected or does not exist', () => {
		const uiElement = document.createElement( 'div' );

		const mockEditor = {
			ui: { element: uiElement }
		} as unknown as Editor;

		expect( () => cleanupOrphanEditorElements( mockEditor ) ).not.toThrow();
		expect( () => cleanupOrphanEditorElements( { ui: {} } as Editor ) ).not.toThrow();
	} );

	it( 'should remove _bodyCollectionContainer from the DOM if it is connected', () => {
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

		const mockEditor = {
			ui: {
				view: {
					body: {
						_bodyCollectionContainer: container
					}
				}
			}
		} as unknown as Editor;

		expect( container.isConnected ).toBe( true );
		cleanupOrphanEditorElements( mockEditor );
		expect( container.isConnected ).toBe( false );
	} );

	it( 'should clean up corresponding attributes and classes from domRoots', () => {
		const rootElement = document.createElement( 'div' );

		// Set attributes
		rootElement.setAttribute( 'contenteditable', 'true' );
		rootElement.setAttribute( 'role', 'textbox' );
		rootElement.setAttribute( 'aria-label', 'Rich Text Editor' );
		rootElement.setAttribute( 'aria-multiline', 'true' );
		rootElement.setAttribute( 'spellcheck', 'false' );

		rootElement.classList.add(
			'ck', 'ck-content', 'ck-editor__editable',
			'ck-rounded-corners', 'ck-editor__editable_inline',
			'ck-blurred', 'ck-focused', 'my-custom-class'
		);

		const domRoots = new Map();
		domRoots.set( 'main', rootElement );

		const mockEditor = {
			editing: {
				view: {
					domRoots
				}
			}
		} as unknown as Editor;

		cleanupOrphanEditorElements( mockEditor );

		expect( rootElement.hasAttribute( 'contenteditable' ) ).toBe( false );
		expect( rootElement.hasAttribute( 'role' ) ).toBe( false );
		expect( rootElement.hasAttribute( 'aria-label' ) ).toBe( false );
		expect( rootElement.hasAttribute( 'aria-multiline' ) ).toBe( false );
		expect( rootElement.hasAttribute( 'spellcheck' ) ).toBe( false );

		const removedClasses = [
			'ck', 'ck-content', 'ck-editor__editable',
			'ck-rounded-corners', 'ck-editor__editable_inline',
			'ck-blurred', 'ck-focused'
		];

		removedClasses.forEach( className => {
			expect( rootElement.classList.contains( className ) ).toBe( false );
		} );

		expect( rootElement.classList.contains( 'my-custom-class' ) ).toBe( true );
	} );

	it( 'should ignore objects in domRoots that are not instances of HTMLElement', () => {
		const fakeRoot = {
			removeAttribute: () => {},
			classList: { remove: () => {} }
		};

		const domRoots = new Map();
		domRoots.set( 'main', fakeRoot );

		const mockEditor = {
			editing: {
				view: {
					domRoots
				}
			}
		} as unknown as Editor;

		expect( () => cleanupOrphanEditorElements( mockEditor ) ).not.toThrow();
	} );

	it( 'should fail gracefully on an empty editor object', () => {
		const emptyEditor = {} as unknown as Editor;

		expect( () => cleanupOrphanEditorElements( emptyEditor ) ).not.toThrow();
	} );
} );
