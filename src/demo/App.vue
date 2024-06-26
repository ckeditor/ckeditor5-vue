<template>
  <h1>Example of using CKEditor 5 in Vue.js 3.x</h1>

  <ckeditor
    v-model="data"
    tag-name="textarea"
    :disable-two-way-data-binding="isTwoWayDataBindingDisabled"
    :editor="TestEditor"
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
import { ref, reactive } from 'vue';
import {
	ClassicEditor,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	type EventInfo
} from 'ckeditor5';

class TestEditor extends ClassicEditor {
	static builtinPlugins = [
		Essentials,
		Paragraph,
		Heading,
		Bold,
		Italic
	];
}

// State
const editorInstance = ref<TestEditor | null>( null );
const data = ref( '<p>Hello world!</p>' );
const disabled = ref( false );
const isTwoWayDataBindingDisabled = ref( false );
const config = reactive( {
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
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

function onReady( editor: TestEditor ) {
	editorInstance.value = editor;

	console.log( 'Editor is ready.', { editor } );
}

function onFocus( event: EventInfo, editor: TestEditor ) {
	console.log( 'Editor focused.', { event, editor } );
}

function onBlur( event: EventInfo, editor: TestEditor ) {
	console.log( 'Editor blurred.', { event, editor } );
}

function onInput( data: string, event: EventInfo, editor: TestEditor ) {
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
