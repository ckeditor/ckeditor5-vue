/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { onBeforeUnmount, type Ref } from 'vue';
import type { CKEditorError, Editor } from 'ckeditor5';

import { REPORTING_UNAVAILABLE_WARNING } from './useEditorVersionCheck.js';
import type { WithErrorReporting } from '../types.js';

/**
 * Reports the errors that escape a running editor, and releases the registration when the component goes
 * away. One registration serves the whole page, so the caller is told only about its own editor.
 *
 * Returns the function that starts reporting, because the editor does not exist yet when the component is
 * set up. Call it once the editor is created.
 */
export function useEditorErrorReporting( isUnmounted: Ref<boolean> ) {
	let off: ( () => void ) | null = null;

	onBeforeUnmount( () => {
		off?.();
		off = null;
	} );

	return function reportErrorsOf(
		EditorClass: Partial<WithErrorReporting>,
		editor: Editor,
		report: ( error: CKEditorError ) => void
	): void {
		// A class that predates the reporting API has no static to read. Say what stops working and carry
		// on: the editor is running, so a missing static must not be reported as a failure to create one.
		if ( typeof EditorClass.onEditorError != 'function' ) {
			console.warn( REPORTING_UNAVAILABLE_WARNING );

			return;
		}

		off = EditorClass.onEditorError( ( { error, source } ) => {
			if ( source !== editor || isUnmounted.value ) {
				return;
			}

			report( error );
		} );
	};
}
