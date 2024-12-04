/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, it, vi, expect, expectTypeOf } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';

import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';
import type { CKEditorCloudConfig } from '@ckeditor/ckeditor5-integrations-common';

import useCKEditorCloud from '../src/useCKEditorCloud.js';

describe( 'useCKEditorCloud', { timeout: 8000 }, () => {
	beforeEach( removeAllCkCdnResources );

	it( 'should load CKEditor bundle from CDN', async () => {
		const { data } = useCKEditorCloud( {
			version: '43.0.0'
		} );

		await flushPromises();
		await vi.waitFor( () => {
			expect( data.value?.CKEditor ).toBeDefined();
		} );
	} );

	it( 'should load CKEditor premium bundle from CDN', async () => {
		const { data } = useCKEditorCloud( {
			version: '43.0.0',
			premium: true
		} );

		await flushPromises();
		await vi.waitFor( () => {
			expect( data.value?.CKEditor ).toBeDefined();
			expect( data.value?.CKEditorPremiumFeatures ).toBeDefined();
		}, { timeout: 4000 } );
	} );

	it( 'should load additional resources from CDN after updating config ref', async () => {
		const config = ref<CKEditorCloudConfig>( {
			version: '43.0.0'
		} );

		const { data } = useCKEditorCloud( config );

		config.value.premium = true;

		await vi.waitFor( () => {
			expect( data.value?.CKEditor ).toBeDefined();
			expect( data.value?.CKEditorPremiumFeatures ).toBeDefined();
		}, { timeout: 4000 } );
	} );

	describe( 'typings', () => {
		it( 'should return non-nullable premium features entry type if premium is enabled', async () => {
			const { data } = useCKEditorCloud( {
				version: '43.0.0',
				premium: true
			} );

			await vi.waitFor( () => {
				expect( data.value?.CKEditor ).toBeDefined();
			}, { timeout: 4000 } );

			if ( data.value ) {
				expectTypeOf( data.value?.CKEditorPremiumFeatures ).not.toBeNullable();
			}
		} );

		it( 'should return nullable premium features entry type if premium is not passed', async () => {
			const { data } = useCKEditorCloud( {
				version: '43.0.0'
			} );

			await vi.waitFor( () => {
				expect( data.value?.CKEditor ).toBeDefined();
			}, { timeout: 4000 } );

			if ( data.value ) {
				expectTypeOf( data.value.CKEditorPremiumFeatures ).toBeNullable();
			}
		} );

		it( 'should return nullable premium features entry type if premium is false', async () => {
			const { data } = useCKEditorCloud( {
				version: '43.0.0',
				premium: false
			} );

			await vi.waitFor( () => {
				expect( data.value?.CKEditor ).toBeDefined();
			}, { timeout: 4000 } );

			if ( data.value ) {
				expectTypeOf( data.value.CKEditorPremiumFeatures ).toBeNullable();
			}
		} );

		it( 'should return non-nullable ckbox entry type if ckbox enabled', async () => {
			const { data } = useCKEditorCloud( {
				version: '43.0.0',
				ckbox: {
					version: '2.5.1'
				}
			} );

			await vi.waitFor( () => {
				expect( data.value?.CKEditor ).toBeDefined();
			}, { timeout: 4000 } );

			if ( data.value ) {
				expectTypeOf( data.value.CKBox ).not.toBeNullable();
			}
		} );

		it( 'should return nullable ckbox entry type if ckbox not configured', async () => {
			const { data } = useCKEditorCloud( {
				version: '43.0.0'
			} );

			await vi.waitFor( () => {
				expect( data.value?.CKEditor ).toBeDefined();
			}, { timeout: 4000 } );

			if ( data.value ) {
				expectTypeOf( data.value.CKBox ).toBeNullable();
			}
		} );
	} );
} );
