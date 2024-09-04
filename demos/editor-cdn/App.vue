<template>
  <h2>Using CKEditor 5 from CDN in Vue 3</h2>

  <ckeditor
    v-if="TestEditor"
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
import { ref, reactive, computed } from 'vue';
import useCKEditorCloud from '../../src/useCKEditorCloud';
import type { EventInfo, ClassicEditor } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

// Load CKEditor from the CDN
const cloud = useCKEditorCloud( {
	version: '43.0.0'
} );

const TestEditor = computed<typeof ClassicEditor | null>( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	const {
		ClassicEditor: BaseEditor, Paragraph,
		Essentials, Heading, Bold, Italic
	} = cloud.data.value.CKEditor;

	return class TestEditor extends BaseEditor {
		static builtinPlugins = [
			Essentials,
			Paragraph,
			Heading,
			Bold,
			Italic
		];
	};
} );

// State
const editorInstance = ref<ClassicEditor | null>( null );
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

function onReady( editor: ClassicEditor ) {
	editorInstance.value = editor;

	console.log( 'Editor is ready.', { editor } );
}

function onFocus( event: EventInfo, editor: ClassicEditor ) {
	console.log( 'Editor focused.', { event, editor } );
}

function onBlur( event: EventInfo, editor: ClassicEditor ) {
	console.log( 'Editor blurred.', { event, editor } );
}

function onInput( data: string, event: EventInfo, editor: ClassicEditor ) {
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
