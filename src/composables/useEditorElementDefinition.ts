/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import type { EditorRelaxedConfig, EditorRelaxedConstructor } from '@ckeditor/ckeditor5-integrations-common';

import type { EditorElementDefinition } from '../utils/normalizeEditorElementDefinition.js';
import { isClassicEditor } from '../utils/isClassicEditor.js';

/**
 * Picks editor element definition from config if provided.
 */
export function useEditorElementDefinition(
	{
		Editor,
		config,
		defaultElementName
	}: Options
): ComputedRef<EditorElementDefinition> {
	return computed<EditorElementDefinition>( () => {
		const _config = toValue( config );
		const _Editor = toValue( Editor );

		if ( !isClassicEditor( _Editor ) ) {
			const customElementDefinition = _config.roots?.main?.element ?? _config.root?.element;

			if ( customElementDefinition ) {
				return customElementDefinition;
			}
		}

		return toValue( defaultElementName );
	} );
}

type Options = {
	Editor: MaybeRefOrGetter<EditorRelaxedConstructor>;
	config: MaybeRefOrGetter<EditorRelaxedConfig>;
	defaultElementName: MaybeRefOrGetter<string>;
};
