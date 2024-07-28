/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { ref, type Ref } from 'vue';
import { useAsync, type AsyncComposableResult } from '../composables/useAsync';

import { loadCKEditorCloud } from '../plugin';
import type {
	CKExternalPluginsMap,
	CKEditorCloudConfig,
	CKEditorCloudResult
} from './cdn';

/**
 * A composable function that loads CKEditor Cloud services.
 *
 * @param config The configuration of the CKEditor Cloud services.
 * @returns The result of the loaded CKEditor Cloud services.
 * @template A The type of the additional resources to load.
 * @example
 * ```ts
 * const { data } = useCKEditorCloud( {
 * 	version: '42.0.0',
 * 	languages: [ 'en', 'de' ],
 * 	withPremiumFeatures: true
 * } );
 *
 * if ( data ) {
 * 	const { CKEditor, CKEditorPremiumFeatures } = data;
 * 	const { Paragraph } = CKEditor;
 *
 * 	// ..
 * }
 */
export default function useCKEditorCloud<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): AsyncComposableResult<CKEditorCloudResult<A>> {
	const currentConfig: Ref<CKEditorCloudConfig<A> | null> = ref( null );

	if ( JSON.stringify( currentConfig ) !== JSON.stringify( config ) ) {
		currentConfig.value = config;
	}

	return useAsync(
		(): Promise<CKEditorCloudResult<A>> => loadCKEditorCloud( currentConfig.value! )
	);
}
