<template>
  <h1>Example of using CKEditor 5 in Vue.js 3.x</h1>

  <ckeditor
    v-if="EditorConstructor"
    v-model="data"
    tag-name="textarea"
    :disable-two-way-data-binding="isTwoWayDataBindingDisabled"
    :editor="EditorConstructor"
    :config="config"
    :disabled="disabled"
    @ready="onReady"
    @focus="onFocus"
    @blur="onBlur"
    @input="onInput"
    @destroy="onDestroy"
  />

  <button @click="toggleEditorDisabled">
    {{ disabled ? 'Enable' : 'Disable' }} editor
  </button>

  <button @click="toggleTwoWayBinding">
    {{ isTwoWayDataBindingDisabled ? 'Enable' : 'Disable' }} two way binding
  </button>

  <button
    v-if="isTwoWayDataBindingDisabled"
    @click="setEditorData"
  >
    Set editor data
  </button>

  <h2>Live editor data</h2>

  <textarea v-model="data" />
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue';

import type * as CKEditor5 from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import { useCKEditorCloud } from '../../src/plugin.js';

const cloud = useCKEditorCloud( {
	version: '42.0.2'
} );

// State
const data = ref( '<p>Hello world!</p>' );
const disabled = ref( false );
const isTwoWayDataBindingDisabled = ref( false );
const config = reactive( {
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
} );

const EditorConstructor = ref<typeof CKEditor5.ClassicEditor | null>( null );
const editorInstance = ref<CKEditor5.ClassicEditor | null>( null );

watchEffect( () => {
	if ( !cloud.data.value ) {
		return;
	}

	const { ClassicEditor, Paragraph, Essentials, Heading, Bold, Italic } = cloud.data.value.CKEditor;

	EditorConstructor.value = class TestEditor extends ClassicEditor {
		static builtinPlugins = [
			Essentials,
			Paragraph,
			Heading,
			Bold,
			Italic
		];
	};
} );

// Methods
function setEditorData() {
	data.value = editorInstance.value?.getData() ?? '';
}

function toggleTwoWayBinding() {
	isTwoWayDataBindingDisabled.value = !isTwoWayDataBindingDisabled.value;
}

function toggleEditorDisabled() {
	disabled.value = !disabled.value;
}

function onReady( editor: CKEditor5.ClassicEditor ) {
	editorInstance.value = editor;

	console.log( 'Editor is ready.', { editor } );
}

function onFocus( event: CKEditor5.EventInfo, editor: CKEditor5.ClassicEditor ) {
	console.log( 'Editor focused.', { event, editor } );
}

function onBlur( event: CKEditor5.EventInfo, editor: CKEditor5.ClassicEditor ) {
	console.log( 'Editor blurred.', { event, editor } );
}

function onInput( data: string, event: CKEditor5.EventInfo, editor: CKEditor5.ClassicEditor ) {
	console.log( 'Editor data input.', { event, editor, data } );
}

function onDestroy() {
	console.log( 'Editor destroyed.' );
}
</script>

<style>
body {
	max-width: 800px;
	margin: 20px auto;
}

textarea {
	width: 100%;
	height: 100px;
	font-family: monospace;
}

button {
	margin-top: 10px;
}
</style>
