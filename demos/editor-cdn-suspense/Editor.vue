<template>
  <h2>Using CKEditor 5 from CDN and &lt;Suspense&gt; in Vue 3</h2>

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

<script async setup lang="ts">
import { ref, reactive } from 'vue';

import type * as CKEditor5 from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import { loadCKEditorCloud } from '../../src/plugin.js';

// Load CKEditor from the CDN
const { CKEditor } = await loadCKEditorCloud( {
	version: '43.0.0'
} );

const { ClassicEditor, Paragraph, Essentials, Heading, Bold, Italic } = CKEditor;

class EditorConstructor extends ClassicEditor {
	static builtinPlugins = [
		Essentials,
		Paragraph,
		Heading,
		Bold,
		Italic
	];
}

// State
const data = ref( '<p>Hello world!</p>' );
const disabled = ref( false );
const isTwoWayDataBindingDisabled = ref( false );
const config = reactive( {
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
} );

const editorInstance = ref<CKEditor5.ClassicEditor | null>( null );

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
