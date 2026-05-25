/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { kebabToCamelCase, mapObjectKeys, type EditorRelaxedConfig } from '@ckeditor/ckeditor5-integrations-common';

import type { EditorWithWatchdogRelaxedConstructor } from '../types.js';
import {
	normalizeEditorElementDefinition,
	type EditorElementObjectDefinition,
	type EditorElementDefinition
} from '../utils/normalizeEditorElementDefinition.js';

/**
 * Picks editor element definition from config if provided.
 */
export function useEditorElementDefinition(
	{
		Editor,
		config,
		defaultElementName
	}: Options
): ComputedRef<EditorElementObjectDefinition> {
	return computed( () => {
		const _config = toValue( config );
		const _Editor = toValue( Editor );

		let definition: EditorElementDefinition = toValue( defaultElementName );

		if ( _Editor.editorName && _Editor.editorName !== 'ClassicEditor' ) {
			const customElementDefinition = _config.roots?.main?.element ?? _config.root?.element;

			if ( customElementDefinition ) {
				definition = customElementDefinition;
			}
		}

		const { styles, ...normalizedDefinition } = normalizeEditorElementDefinition( definition );

		return {
			...normalizedDefinition,
			styles: styles && mapObjectKeys( styles, kebabToCamelCase )
		};
	} );
}

type Options = {
	Editor: MaybeRefOrGetter<EditorWithWatchdogRelaxedConstructor>;
	config: MaybeRefOrGetter<EditorRelaxedConfig>;
	defaultElementName: MaybeRefOrGetter<string>;
};
