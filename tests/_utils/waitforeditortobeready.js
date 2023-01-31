/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout */
import { nextTick } from 'vue';

export default async () => {
	await nextTick();
	await new Promise( res => setTimeout( res, 1 ) );
};
