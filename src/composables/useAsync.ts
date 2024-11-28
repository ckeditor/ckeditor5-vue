/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	computed, ref,
	shallowReadonly, watchEffect,
	type ComputedRef, type Ref
} from 'vue';

import { uid } from '@ckeditor/ckeditor5-integrations-common';

/**
 * A composable that executes an async function and provides the result.
 *
 * @param asyncFunc The async function to execute.
 * @returns The result of the async function.
 * @example
 *
 * ```ts
 * const { loading, data, error } = useAsync( async () => {
 * 	const response = await fetch( 'https://api.example.com/data' );
 * 	return response.json();
 * } );
 * ```
 */
export const useAsync = <R>(
	asyncFunc: () => Promise<R>
): AsyncComposableResult<R> => {
	// The UUID of the last query to prevent race conditions between multiple queries.
	const lastQueryUUID = ref<string | null>( null );

	// The error thrown by the async function.
	const error = ref<Error | null>( null );

	// The data returned by the async function.
	const data: Ref<R | null> = ref( null );

	// Whether the async function is currently loading.
	const loading = computed( () => lastQueryUUID.value !== null );

	// Execute the async function and update the result. This will be re-executed
	// whenever refs used inside the `asyncFunc` change.
	watchEffect( async () => {
		const currentQueryUID = uid();

		lastQueryUUID.value = currentQueryUID;
		data.value = null;
		error.value = null;

		// This function is called before updating `data`, `error` or `loading`
		// because the `watchEffect` could be re-triggered with the new data
		// while waiting for the previous `asyncFunc` to resolve.
		const shouldDiscardQuery = () => lastQueryUUID.value !== currentQueryUID;

		try {
			const result = await asyncFunc();

			if ( !shouldDiscardQuery() ) {
				data.value = result;
			}
		} catch ( err: any ) {
			console.error( err );

			if ( !shouldDiscardQuery() ) {
				error.value = err;
			}
		} finally {
			if ( !shouldDiscardQuery() ) {
				lastQueryUUID.value = null;
			}
		}
	} );

	return {
		loading: shallowReadonly( loading ),
		data: shallowReadonly( data ),
		error: shallowReadonly( error )
	};
};

/**
 * The result of the `useAsync` composable.
 */
export type AsyncComposableResult<R> = {

	/**
	 * Whether the async function is currently loading.
	 */
	loading: ComputedRef<boolean>;

	/**
	 * 	The data returned by the async function.
	 */
	data: Ref<R | null>;

	/**
	 * The error thrown by the async function.
	 */
	error: Ref<Error | null>;
};
