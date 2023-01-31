/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout, window */
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import waitForEditorToBeReady from './waitforeditortobeready';

/**
 * Turns off the default error catching
 * so Mocha won't complain about errors caused by the called function.
 */
async function turnOffDefaultErrorCatching( fn ) {
	const originalOnError = window.onerror;
	window.onerror = () => {};

	await fn();

	window.onerror = originalOnError;
}

export default async function( vm ) {
	/* eslint-disable ckeditor5-rules/ckeditor-error-message */
	const error = new CKEditorError( 'foo', vm.getEditor() );

	await turnOffDefaultErrorCatching( () => {
		setTimeout( () => {
			throw error;
		} );
		return waitForEditorToBeReady();
	} );
}
