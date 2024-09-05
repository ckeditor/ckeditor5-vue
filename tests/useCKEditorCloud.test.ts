/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { beforeEach, describe, it, vi, expect } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';

import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';
import type { CKEditorCloudConfig } from '@ckeditor/ckeditor5-integrations-common';

import useCKEditorCloud from '../src/useCKEditorCloud';

describe( 'useCKEditorCloud', () => {
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
		} );
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
		} );
	} );
} );
