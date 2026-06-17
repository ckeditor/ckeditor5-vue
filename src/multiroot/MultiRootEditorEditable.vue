<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <EditorElement
    v-if="elementDefinition"
    ref="editorElementRef"
    :definition="elementDefinition"
  />
</template>


<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import type { MultiRootEditor } from 'ckeditor5';

import EditorElement from '../EditorElement.vue';
import { normalizeEditorElementDefinition } from '../utils/normalizeEditorElementDefinition.js';
import { ROOT_EDITABLE_OPTIONS_ATTRIBUTE } from './constants.js';
import type { RootEditableOptionsAttribute } from './types.js';

defineOptions( {
	name: 'CkeditorMultiRootEditable'
} );

const props = withDefaults( defineProps<{
	id?: string;
	rootName: string;
	editor?: MultiRootEditor | null;
	editableOptions?: RootEditableOptionsAttribute | null;
}>(), {
	id: undefined,
	editor: null,
	editableOptions: null
} );

const editorElementRef = ref<InstanceType<typeof EditorElement>>();

const root = computed( () => props.editor?.model.document.getRoot( props.rootName ) ?? null );

const rootEditableOptions = computed<RootEditableOptionsAttribute | null>( () => {
	const currentRoot = root.value;

	if ( !currentRoot ) {
		return null;
	}

	const options = props.editableOptions ??
		currentRoot.getAttribute( ROOT_EDITABLE_OPTIONS_ATTRIBUTE ) as RootEditableOptionsAttribute | undefined;

	return { ...options };
} );

const elementDefinition = computed( () => {
	const options = rootEditableOptions.value;

	if ( !options ) {
		return null;
	}

	const normalizedDefinition = normalizeEditorElementDefinition( options.element ?? { name: 'div' } );

	return {
		...normalizedDefinition,
		attributes: {
			...normalizedDefinition.attributes,
			id: props.id ?? props.rootName
		}
	};
} );

watchEffect( onCleanup => {
	const editor = props.editor;
	const currentRoot = root.value;
	const options = rootEditableOptions.value;
	const element = editorElementRef.value?.elementRef;

	if ( !editor || !currentRoot || !options || !element ) {
		return;
	}

	if ( editor.ui.getEditableElement( props.rootName ) ) {
		editor.detachEditable( currentRoot );
	}

	const editable = editor.ui.view.createEditable( props.rootName, element, options.label );

	editable.isInlineRoot = !editor.model.schema.checkChild( currentRoot, '$block' );
	editor.ui.addEditable( editable, options.placeholder );
	editor.editing.view.forceRender();

	onCleanup( () => {
		if ( editor.state === 'destroyed' ) {
			return;
		}

		const latestRoot = editor.model.document.getRoot( props.rootName );

		if ( latestRoot === currentRoot ) {
			editor.detachEditable( currentRoot );
		}
	} );
}, { flush: 'post' } );
</script>
