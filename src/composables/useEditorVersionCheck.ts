/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { compareInstalledCKBaseVersion } from '@ckeditor/ckeditor5-integrations-common';

/**
 * Said when the editor class handed to a component has no error reporting to read. It is the same cause as
 * the version warning below, but a different consequence, and the multi-root path has no version check of
 * its own — so this is the only thing an integrator there would hear.
 */
export const REPORTING_UNAVAILABLE_WARNING =
	'Reporting errors that escape a running editor requires CKEditor 5 in version 49+ or a nightly build. ' +
	'The "error" event will only report a failure to create an editor.';

/**
 * Hook that check if integration is compatible with installed version of the editor.
 */
export function useEditorVersionCheck(): void {
	switch ( compareInstalledCKBaseVersion( '49.0.0' ) ) {
		case null:
			console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
			break;

		case -1:
			console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 49+ or nightly build.' );
			break;
	}
}
