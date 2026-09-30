/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Runs the callback with the first uncaught error swallowed, so that throwing on purpose does not fail
 * the test run. The error still reaches the reporter — only the default logging is suppressed.
 */
export async function turnOffErrors( callback: () => void | Promise<void> ): Promise<void> {
	const handler = ( evt: ErrorEvent ) => {
		evt.preventDefault();
	};

	window.addEventListener( 'error', handler, { capture: true, once: true } );

	try {
		await callback();
		await new Promise( resolve => setTimeout( resolve, 150 ) );
	} finally {
		window.removeEventListener( 'error', handler );
	}
}
