/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	ref, watchEffect, computed,
	type Ref,
	type ComputedRef
} from 'vue';

import { uid } from '../utils/uid';

/**
 * A composable function that executes an asynchronous function and provides the result of the operation.
 *
 * @param asyncFunc The asynchronous function to execute.
 * @returns The result of the asynchronous operation.
 * @example
 *
 * ```ts
 * const { loading, data, error } = useAsync( async () => {
 * 	const response = await fetch( 'https://api.example.com/data' );
 * 	return response.json();
 * } );
 * ```
 */
export const useAsync = <R>( asyncFunc: () => Promise<R> ): AsyncComposableResult<R> => {
	// The unique identifier of the last query, avoid race conditions while executing multiple queries in row.
	const lastQueryUID = ref<string | null>( null );
	const error = ref<Error | null>( null );
	const data: Ref<R | null> = ref( null );

	// Indicates whether the asynchronous operation is in progress.
	const loading = computed( () => lastQueryUID.value !== null );

	const execute = () => {
		const currentQueryUID = uid();

		lastQueryUID.value = currentQueryUID;
		data.value = null;
		error.value = null;

		return asyncFunc()
			.then( res => {
				if ( lastQueryUID.value === currentQueryUID ) {
					data.value = res;
				}
			} )
			.catch( err => {
				if ( lastQueryUID.value === currentQueryUID ) {
					error.value = err;
				}
			} )
			.finally( () => {
				if ( lastQueryUID.value === currentQueryUID ) {
					lastQueryUID.value = null;
				}
			} );
	};

	watchEffect( () => {
		execute();
	} );

	return {
		loading,
		data,
		error
	};
};

/**
 * Represents the result of an asynchronous operation in a composable function.
 *
 * @template R The type of the data returned by the asynchronous operation.
 */
export type AsyncComposableResult<R> = {

	/**
	 * Indicates whether the asynchronous operation is in progress.
	 */
	loading: ComputedRef<boolean>;

	/**
	 * The data returned by the asynchronous operation.
	 */
	data: Ref<R | null>;

	/**
	 * The error thrown by the asynchronous operation.
	 */
	error: Ref<Error | null>;
};
