<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <div ref="toolbarRef" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { MultiRootEditor } from 'ckeditor5';

defineOptions( {
	name: 'CkeditorMultiRootToolbar'
} );

const props = withDefaults( defineProps<{
	editor?: MultiRootEditor | null;
}>(), {
	editor: null
} );

const toolbarRef = ref<HTMLDivElement>();

watchEffect( onCleanup => {
	const editor = props.editor;
	const toolbarContainer = toolbarRef.value;

	if ( !editor || !toolbarContainer ) {
		return;
	}

	const toolbarElement = editor.ui.view.toolbar.element;

	if ( !toolbarElement ) {
		return;
	}

	toolbarContainer.appendChild( toolbarElement );

	onCleanup( () => {
		if ( toolbarContainer.contains( toolbarElement ) ) {
			toolbarContainer.removeChild( toolbarElement );
		}
	} );
}, { flush: 'post' } );
</script>
