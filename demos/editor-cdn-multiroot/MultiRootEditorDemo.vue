<template>
  <h2 class="subtitle">
    Multi-root Editor Demo
  </h2>
  <p class="info">
    This sample demonstrates the minimal Vue application that uses multi-root editor integration.<br>
    You may use it as a starting point for your application.
  </p>
  <hr><br>

  <CkeditorMultiRoot
    v-model="editorData"
    v-model:roots-attributes="editorRootsAttributes"
    :editor="props.editor"
  >
    <template #default="{ editor: currentEditor, roots }">
      <div>
        <CkeditorMultiRootUI :editor="currentEditor" />

        <CkeditorMultiRootEditable
          v-for="rootName in roots"
          :id="rootName"
          :key="rootName"
          :root-name="rootName"
          :editor="currentEditor"
        />
      </div>
    </template>
  </CkeditorMultiRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MultiRootEditor as MultiRootEditorType } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

import type {
	MultiRootEditorData,
	MultiRootEditorRootsAttributes
} from '../../src/plugin.js';

const props = defineProps<{
	editor: typeof MultiRootEditorType;
	data: MultiRootEditorData;
	rootsAttributes: MultiRootEditorRootsAttributes;
}>();

const editorData = ref<MultiRootEditorData>( { ...props.data } );
const editorRootsAttributes = ref<MultiRootEditorRootsAttributes>( cloneRootsAttributes( props.rootsAttributes ) );

function cloneRootsAttributes( rootsAttributes: MultiRootEditorRootsAttributes ): MultiRootEditorRootsAttributes {
	return Object.keys( rootsAttributes ).reduce<MultiRootEditorRootsAttributes>( ( result, rootName ) => {
		result[ rootName ] = {
			...rootsAttributes[ rootName ]
		};

		return result;
	}, {} );
}
</script>
