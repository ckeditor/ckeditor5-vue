<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <div ref="uiRef" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { Editor } from 'ckeditor5';

defineOptions( {
	name: 'CkeditorElement'
} );

type UIElementName = 'menuBar' | 'toolbar';

type EditorWithUIView = Editor & {
	ui: {
		view: EditorUIViewWithElements;
	};
};

type EditorUIViewWithElements = {
	menuBarView?: {
		element?: HTMLElement | null;
	};
	toolbar?: {
		element?: HTMLElement | null;
	};
};

const props = withDefaults( defineProps<{
	editor?: EditorWithUIView | null;
	element?: UIElementName;
}>(), {
	editor: null,
	element: 'toolbar'
} );

const uiRef = ref<HTMLDivElement>();

watchEffect( onCleanup => {
	const editor = props.editor;
	const uiContainer = uiRef.value;

	if ( !editor || !uiContainer ) {
		return;
	}

	const uiElement = props.element === 'menuBar' ?
		editor.ui.view.menuBarView?.element :
		editor.ui.view.toolbar?.element;

	if ( !uiElement ) {
		return;
	}

	uiContainer.appendChild( uiElement );

	onCleanup( () => {
		if ( uiContainer.contains( uiElement ) ) {
			uiContainer.removeChild( uiElement );
		}
	} );
}, { flush: 'post' } );
</script>
