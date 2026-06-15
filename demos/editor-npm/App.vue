<template>
  <h2>Using CKEditor 5 from NPM in Vue 3</h2>

  <ckeditor
    :key="isInline ? 'inline' : 'block'"
    v-model="data"
    tag-name="textarea"
    :disable-two-way-data-binding="isTwoWayDataBindingDisabled"
    :editor="ClassicEditor"
    :config="config"
    :disabled="disabled"
    @ready="onReady"
    @focus="onFocus"
    @blur="onBlur"
    @input="onInput"
    @destroy="onDestroy"
  />

  <div class="controls">
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

    <label>
      <input
        v-model="isInline"
        type="checkbox"
      >
      Inline mode
    </label>
  </div>

  <h2>Live editor data</h2>

  <textarea v-model="data" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
	ClassicEditor,
	Autoformat,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	Heading,
	HorizontalLine,
	Indent,
	IndentBlock,
	Italic,
	Link,
	List,
	ListProperties,
	Paragraph,
	PasteFromOffice,
	Strikethrough,
	Table,
	TableColumnResize,
	TableToolbar,
	TextTransformation,
	Underline,
	type EventInfo,
	type EditorConfig
} from 'ckeditor5';

// State
const editorInstance = ref<ClassicEditor | null>( null );
const data = ref( '<p>Hello world!</p>' );
const disabled = ref( false );
const isTwoWayDataBindingDisabled = ref( false );
const isInline = ref( false );

const config = computed<EditorConfig>( () => ( {
	licenseKey: 'GPL',
	plugins: [
		Autoformat,
		BlockQuote,
		Bold,
		Code,
		CodeBlock,
		Essentials,
		Heading,
		HorizontalLine,
		Indent,
		IndentBlock,
		Italic,
		Link,
		List,
		ListProperties,
		Paragraph,
		PasteFromOffice,
		Strikethrough,
		Table,
		TableColumnResize,
		TableToolbar,
		TextTransformation,
		Underline
	],
	toolbar: {
		items: [
			'heading',
			'|',
			'bold', 'italic', 'underline', 'strikethrough', 'code',
			'|',
			'link', 'blockQuote', 'horizontalLine',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'outdent', 'indent',
			'|',
			'insertTable', 'codeBlock'
		],
		shouldNotGroupWhenFull: true
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableColumnResize' ]
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	},
	root: { modelElement: isInline.value ? '$inlineRoot' : '$root' }
} ) );

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

function onInput( data: string, event: EventInfo | null, editor: ClassicEditor ) {
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
	font-family: sans-serif;
}

textarea {
	width: 100%;
	height: 100px;
	font-family: monospace;
}

.controls {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	margin-top: 10px;
}
</style>
