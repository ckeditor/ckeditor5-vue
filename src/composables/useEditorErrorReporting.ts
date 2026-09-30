/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { watch, type Ref } from 'vue';
import type { CKEditorError, Editor } from 'ckeditor5';

import { REPORTING_UNAVAILABLE_WARNING } from './useEditorVersionCheck.js';
import type { WithErrorReporting } from '../types.js';

/**
 * Hook that reports the errors escaping a running editor, for as long as that editor is the current one.
 *
 * The registration follows the instance: it goes up when an editor becomes current and is released when it
 * stops being, which covers replacing the editor and the component going away alike.
 */
export function useEditorErrorReporting<TEditor extends Editor>(
	instance: Ref<TEditor | undefined>,
	editorClass: () => Partial<WithErrorReporting>,
	report: ( error: CKEditorError, editor: TEditor ) => void
): void {
	watch( instance, ( editor, _previousInstance, onCleanup ) => {
		/* istanbul ignore if -- @preserve - Defensive check, the teardown releases the registration. */
		if ( !editor ) {
			return;
		}

		const EditorClass = editorClass();

		// A class that predates the reporting API has no static to read. Say what stops working and carry
		// on: the editor is running, so a missing static must not be reported as a failure to create one.
		if ( typeof EditorClass.onEditorError != 'function' ) {
			console.warn( REPORTING_UNAVAILABLE_WARNING );

			return;
		}

		// One registration serves the whole page, so every editor is heard about here. This is what keeps
		// an error with the editor it came from.
		onCleanup( EditorClass.onEditorError( ( { error, source } ) => {
			if ( source !== editor ) {
				return;
			}

			report( error, editor );
		} ) );
	}, { flush: 'post' } );
}
