/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { it, describe, expect } from 'vitest';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

import { createDefer } from '@ckeditor/ckeditor5-integrations-common';
import { useAsync } from '../../src/composables/useAsync';

describe( 'useAsync', () => {
	it( 'should call async function and return the result in data ref', async () => {
		const { data, loading, error } = useAsync( async () => 'test' );

		expect( error.value ).toBeNull();
		expect( loading.value ).toBe( true );
		expect( data.value ).toBe( null );

		await flushPromises();

		expect( error.value ).toBeNull();
		expect( loading.value ).toBe( false );
		expect( data.value ).toBe( 'test' );
	} );

	it( 'should call async function and return the error in error ref', async () => {
		const errorInstance = new Error( 'test' );
		const { data, loading, error } = useAsync( async () => {
			throw errorInstance;
		} );

		expect( error.value ).toBeNull();
		expect( loading.value ).toBe( true );
		expect( data.value ).toBe( null );

		await flushPromises();

		expect( error.value ).toEqual( errorInstance );
		expect( loading.value ).toBe( false );
		expect( data.value ).toBe( null );
	} );

	it( 'should re-run async function on change ref inside async function', async () => {
		const refValue = ref( 0 );
		const { data } = useAsync( async () => refValue.value );

		await flushPromises();

		expect( data.value ).toBe( 0 );

		refValue.value = 1;
		await flushPromises();

		expect( data.value ).toBe( 1 );
	} );

	it( 'should discard the result of the previous async function call if the new one is started', async () => {
		const defer = createDefer();
		const refValue = ref( 0 );

		const { data } = useAsync( async () => {
			if ( refValue.value === 0 ) {
				await defer.promise;
			}

			return refValue.value;
		} );

		refValue.value = 1;
		refValue.value = 123;

		defer.resolve();
		await flushPromises();

		expect( data.value ).toBe( 123 );
	} );

	it( 'should discard the error of the previous async function call if the new one is started', async () => {
		const defer = createDefer();
		const refValue = ref( 0 );

		const { data, error } = useAsync( async () => {
			if ( refValue.value === 0 ) {
				await defer.promise;
				throw new Error( 'test' );
			}

			return refValue.value;
		} );

		refValue.value = 1;
		refValue.value = 123;

		defer.resolve();
		await flushPromises();

		expect( data.value ).toBe( 123 );
		expect( error.value ).toBeNull();
	} );
} );
