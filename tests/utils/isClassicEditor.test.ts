/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import type { EditorRelaxedConstructor } from '@ckeditor/ckeditor5-integrations-common';
import { isClassicEditor } from '../../src/utils/isClassicEditor.js';

describe( 'isClassicEditor()', () => {
	it( 'should return true when editorName is not set', () => {
		expect( isClassicEditor( {} as EditorRelaxedConstructor ) ).toBe( true );
	} );

	it( 'should return true when editorName is "ClassicEditor"', () => {
		expect( isClassicEditor( { editorName: 'ClassicEditor' } as EditorRelaxedConstructor ) ).toBe( true );
	} );

	it( 'should return false when editorName is set to a different editor name', () => {
		expect( isClassicEditor( { editorName: 'BalloonEditor' } as EditorRelaxedConstructor ) ).toBe( false );
	} );
} );
