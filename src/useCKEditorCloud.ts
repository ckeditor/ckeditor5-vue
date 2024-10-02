/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { toValue, type MaybeRefOrGetter } from 'vue';
import { useAsync, type AsyncComposableResult } from './composables/useAsync.js';

import {
	loadCKEditorCloud,
	type CKEditorCloudConfig,
	type CKEditorCloudResult
} from '@ckeditor/ckeditor5-integrations-common';

/**
 * A composable function that loads CKEditor Cloud services.
 *
 * @param config The configuration of the CKEditor Cloud services.
 * @returns The result of the loaded CKEditor Cloud services.
 * @template Config The type of the CKEditor Cloud configuration.
 * @experimental
 * @example
 * ```ts
 * const { data } = useCKEditorCloud( {
 * 	version: '43.0.0',
 * 	languages: [ 'en', 'de' ],
 * 	premium: true
 * } );
 *
 * if ( data.value ) {
 * 	const { CKEditor, CKEditorPremiumFeatures } = data.value;
 * 	const { Paragraph } = CKEditor;
 *
 * 	// ..
 * }
 */
export default function useCKEditorCloud<Config extends CKEditorCloudConfig>(
	config: MaybeRefOrGetter<Config>
): AsyncComposableResult<CKEditorCloudResult<Config>> {
	return useAsync(
		(): Promise<CKEditorCloudResult<Config>> => loadCKEditorCloud(
			toValue( config )
		)
	);
}
