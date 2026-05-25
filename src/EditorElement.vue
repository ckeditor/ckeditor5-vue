<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<script setup lang="ts">
import { computed, ref, toValue } from 'vue';
import { kebabToCamelCase, mapObjectKeys } from '@ckeditor/ckeditor5-integrations-common';

import { type EditorElementDefinition, normalizeEditorElementDefinition } from './utils/normalizeEditorElementDefinition.js';

const props = withDefaults(
	defineProps<{
		definition?: EditorElementDefinition | null;
	}>(),
	{
		definition: null
	}
);

const elementRef = ref<HTMLElement>();

defineExpose( { elementRef } );

const definition = computed( () =>
	normalizeEditorElementDefinition( props.definition ?? 'div' )
);

const mappedStyles = computed( () => {
	const styles = toValue( definition ).styles;

	return styles && mapObjectKeys( styles, kebabToCamelCase );
} );
</script>

<template>
  <component
    :is="definition.name"
    ref="elementRef"
    v-bind="definition.attributes"
    :class="definition.classes"
    :style="mappedStyles"
  />
</template>
