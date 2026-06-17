<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <div ref="uiRef" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { MultiRootEditor } from 'ckeditor5';

defineOptions( {
	name: 'CkeditorMultiRootUI'
} );

type EditorUIViewWithElements = MultiRootEditor[ 'ui' ][ 'view' ] & {
	menuBarView?: {
		element?: HTMLElement | null;
	};
	toolbar?: {
		element?: HTMLElement | null;
	};
};

const props = withDefaults( defineProps<{
	editor?: MultiRootEditor | null;
}>(), {
	editor: null
} );

const uiRef = ref<HTMLDivElement>();

watchEffect( onCleanup => {
	const editor = props.editor;
	const uiContainer = uiRef.value;

	if ( !editor || !uiContainer ) {
		return;
	}

	const editorUIView = editor.ui.view as EditorUIViewWithElements;
	const uiElements = [
		editorUIView.menuBarView?.element,
		editorUIView.toolbar?.element
	].filter( ( element ): element is HTMLElement => !!element );

	if ( !uiElements.length ) {
		return;
	}

	uiElements.forEach( element => uiContainer.appendChild( element ) );

	onCleanup( () => {
		for ( const element of uiElements ) {
			if ( uiContainer.contains( element ) ) {
				uiContainer.removeChild( element );
			}
		}
	} );
}, { flush: 'post' } );
</script>
