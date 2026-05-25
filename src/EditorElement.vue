<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<script setup lang="ts">
import { ref } from 'vue';
import type {  EditorElementObjectDefinition } from './utils/normalizeEditorElementDefinition.js';

const { definition } = defineProps<{
	definition: EditorElementObjectDefinition;
}>();

const elementRef = ref<HTMLElement>();

defineExpose( { elementRef } );
</script>

<template>
  <component
    :is="definition.name"
    ref="elementRef"
    v-bind="definition.attributes"
    :class="definition.classes"
    :style="definition.styles"
  />
</template>
