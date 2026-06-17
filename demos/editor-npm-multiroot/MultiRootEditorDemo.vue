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
    :editor="MultiRootEditor"
  >
    <template #default="{ editor, roots }">
      <div>
        <CkeditorMultiRootUI :editor="editor" />

        <CkeditorMultiRootEditable
          v-for="rootName in roots"
          :id="rootName"
          :key="rootName"
          :root-name="rootName"
          :editor="editor"
        />
      </div>
    </template>
  </CkeditorMultiRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type {
	MultiRootEditorData,
	MultiRootEditorRootsAttributes
} from '../../src/plugin.js';

import MultiRootEditor from './MultiRootEditor.js';

const props = defineProps<{
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
