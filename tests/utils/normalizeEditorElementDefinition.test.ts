/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import {
	normalizeEditorElementDefinition,
	type EditorElementObjectDefinition
} from '../../src/utils/normalizeEditorElementDefinition.js';

describe( 'normalizeEditorElementDefinition()', () => {
	describe( 'string input', () => {
		it( 'should wrap a plain tag name into an object definition', () => {
			const result = normalizeEditorElementDefinition( 'div' );

			expect( result ).to.deep.equal( { name: 'div' } );
		} );

		it( 'should preserve any arbitrary tag name', () => {
			expect( normalizeEditorElementDefinition( 'textarea' ) ).to.deep.equal( { name: 'textarea' } );
			expect( normalizeEditorElementDefinition( 'section' ) ).to.deep.equal( { name: 'section' } );
			expect( normalizeEditorElementDefinition( 'article' ) ).to.deep.equal( { name: 'article' } );
		} );
	} );

	describe( 'object input', () => {
		it( 'should return the object unchanged when only `name` is provided', () => {
			const definition: EditorElementObjectDefinition = { name: 'div' };
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
		} );

		it( 'should return the object unchanged when `classes` is a string', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'div',
				classes: 'ck-editor'
			};
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
			expect( result.classes ).to.equal( 'ck-editor' );
		} );

		it( 'should return the object unchanged when `classes` is an array', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'div',
				classes: [ 'ck-editor', 'ck-editor--theme-dark' ]
			};
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
			expect( result.classes ).to.deep.equal( [ 'ck-editor', 'ck-editor--theme-dark' ] );
		} );

		it( 'should return the object unchanged when `styles` is provided', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'div',
				styles: { color: 'red', fontSize: '16px' }
			};
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
			expect( result.styles ).to.deep.equal( { color: 'red', fontSize: '16px' } );
		} );

		it( 'should return the object unchanged when `attributes` is provided', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'div',
				attributes: { 'data-testid': 'editor', role: 'textbox' }
			};
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
			expect( result.attributes ).to.deep.equal( { 'data-testid': 'editor', role: 'textbox' } );
		} );

		it( 'should return the object unchanged when all optional fields are provided', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'textarea',
				classes: [ 'ck-editor', 'custom' ],
				styles: { minHeight: '200px' },
				attributes: { 'aria-label': 'Rich text editor' }
			};
			const result = normalizeEditorElementDefinition( definition );

			expect( result ).to.equal( definition );
		} );

		it( 'should preserve referential identity of the input object', () => {
			const definition: EditorElementObjectDefinition = { name: 'div' };

			expect( normalizeEditorElementDefinition( definition ) ).to.equal( definition );
		} );
	} );

	describe( 'HTMLElement input', () => {
		it( 'should throw when passed an HTMLElement', () => {
			const element = document.createElement( 'div' );

			expect( () => normalizeEditorElementDefinition( element as any ) ).to.throw(
				'An HTMLElement cannot be used as an editor element definition. ' +
				'Please pass a string or an object definition.'
			);
		} );

		it( 'should throw for any HTMLElement subtype', () => {
			const textarea = document.createElement( 'textarea' );
			const section = document.createElement( 'section' );

			expect( () => normalizeEditorElementDefinition( textarea as any ) ).to.throw();
			expect( () => normalizeEditorElementDefinition( section as any ) ).to.throw();
		} );
	} );
} );
