/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { toValue, type MaybeRefOrGetter } from 'vue';
import { useAsync, type AsyncComposableResult } from './composables/useAsync';

import {
	loadCKEditorCloud,
	type CdnPluginsPacks,
	type CKEditorCloudConfig,
	type CKEditorCloudResult
} from '@ckeditor/ckeditor5-integrations-common';

/**
 * A composable function that loads CKEditor Cloud services.
 *
 * @param config The configuration of the CKEditor Cloud services.
 * @returns The result of the loaded CKEditor Cloud services.
 * @template A The type of the additional resources to load.
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
export default function useCKEditorCloud<A extends CdnPluginsPacks>(
	config: MaybeRefOrGetter<CKEditorCloudConfig<A>>
): AsyncComposableResult<CKEditorCloudResult<A>> {
	return useAsync(
		(): Promise<CKEditorCloudResult<A>> => loadCKEditorCloud(
			toValue( config )
		)
	);
}
