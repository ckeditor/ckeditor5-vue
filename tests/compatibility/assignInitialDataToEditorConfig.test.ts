/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { assignInitialDataToEditorConfig } from '../../src/compatibility/assignInitialDataToEditorConfig.js';
import { setCKEditorVersion } from '../_utils/setCKEditorVersion.js';

describe( 'assignInitialDataToEditorConfig', () => {
	afterEach( () => {
		setCKEditorVersion( undefined );
	} );

	describe( 'when CKEditor >= 48 is loaded', () => {
		beforeEach( () => {
			setCKEditorVersion( '48.0.0' );
		} );

		it( 'should assign data to roots.main.initialData', () => {
			const result = assignInitialDataToEditorConfig( {}, '<p>Hello</p>' ) as any;

			expect( result.roots.main.initialData ).toBe( '<p>Hello</p>' );
		} );

		it( 'should fall back to empty string when data is empty', () => {
			const result = assignInitialDataToEditorConfig( {}, '' ) as any;

			expect( result.roots.main.initialData ).toBe( '' );
		} );

		it( 'should preserve other roots while updating main', () => {
			const config = {
				roots: {
					secondary: { initialData: '<p>Secondary</p>' }
				}
			};

			const result = assignInitialDataToEditorConfig( config, '<p>Main</p>' ) as any;

			expect( result.roots.secondary ).toEqual( { initialData: '<p>Secondary</p>' } );
			expect( result.roots.main.initialData ).toBe( '<p>Main</p>' );
		} );

		it( 'should merge top-level root config into roots.main', () => {
			const config = { root: { someOption: true } };

			const result = assignInitialDataToEditorConfig( config, '<p>Data</p>' ) as any;

			expect( result.roots.main ).toMatchObject( {
				someOption: true,
				initialData: '<p>Data</p>'
			} );
		} );

		it( 'should let roots.main take priority over root when both are specified', () => {
			const config = {
				root: { someOption: true },
				roots: { main: { someOption: false } }
			};

			const result = assignInitialDataToEditorConfig( config, '<p>Data</p>' ) as any;

			expect( result.roots.main.someOption ).toBe( false );
		} );

		it( 'should remove the top-level root property from the result', () => {
			const result = assignInitialDataToEditorConfig( { root: { someOption: true } }, '<p>Data</p>' ) as any;

			expect( result.root ).toBeUndefined();
		} );

		it( 'should remove the top-level initialData property from the result', () => {
			const result = assignInitialDataToEditorConfig( { initialData: '<p>Old</p>' }, '<p>New</p>' ) as any;

			expect( result.initialData ).toBeUndefined();
			expect( result.roots.main.initialData ).toBe( '<p>New</p>' );
		} );

		it( 'should preserve unrelated config properties', () => {
			const result = assignInitialDataToEditorConfig( { language: 'pl', plugins: [ 'Bold' ] }, '<p>Data</p>' ) as any;

			expect( result.language ).toBe( 'pl' );
			expect( result.plugins ).toEqual( [ 'Bold' ] );
		} );
	} );

	describe( 'when CKEditor 47.x LTS is loaded', () => {
		beforeEach( () => {
			setCKEditorVersion( '47.0.0' );
		} );

		it( 'should assign data to top-level initialData', () => {
			const result = assignInitialDataToEditorConfig( {}, '<p>Hello</p>' ) as any;

			expect( result.initialData ).toBe( '<p>Hello</p>' );
		} );

		it( 'should fall back to empty string when data is empty', () => {
			const result = assignInitialDataToEditorConfig( {}, '' ) as any;

			expect( result.initialData ).toBe( '' );
		} );

		it( 'should overwrite existing initialData with the new value', () => {
			const result = assignInitialDataToEditorConfig( { initialData: '<p>Old</p>' }, '<p>New</p>' ) as any;

			expect( result.initialData ).toBe( '<p>New</p>' );
		} );

		it( 'should not create a roots property in the result', () => {
			const result = assignInitialDataToEditorConfig( {}, '<p>Data</p>' ) as any;

			expect( result.roots ).toBeUndefined();
		} );

		it( 'should preserve unrelated config properties', () => {
			const result = assignInitialDataToEditorConfig( { language: 'pl', plugins: [ 'Bold' ] }, '<p>Data</p>' ) as any;

			expect( result.language ).toBe( 'pl' );
			expect( result.plugins ).toEqual( [ 'Bold' ] );
		} );
	} );
} );

