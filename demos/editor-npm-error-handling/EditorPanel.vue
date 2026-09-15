<template>
  <div class="editor">
    <h3>{{ name }}</h3>

    <div class="buttons">
      <button
        :disabled="!editorInstance"
        @click="simulateError"
      >
        Simulate an error
      </button>
    </div>

    <ckeditor
      v-model="data"
      :editor="ClassicEditor"
      :config="config"
      @ready="editorInstance = $event"
      @error="( error, description ) => emit( 'error', name, error, description )"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
	CKEditorError,
	ClassicEditor,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	type EditorConfig
} from 'ckeditor5';
import type { EditorErrorDescription } from '../../src/plugin.js';
import { CrashOnMagicWordPlugin } from './CrashOnMagicWordPlugin.js';

const props = defineProps<{
	name: string;
	initialData: string;
}>();

const emit = defineEmits<{
	error: [ name: string, error: Error, description: EditorErrorDescription<ClassicEditor> ];
}>();

const config: EditorConfig = {
	licenseKey: 'GPL',
	toolbar: [ 'heading', '|', 'bold', 'italic' ],
	plugins: [
		Essentials,
		Paragraph,
		Heading,
		Bold,
		Italic,
		CrashOnMagicWordPlugin
	]
};

const data = ref( props.initialData );
const editorInstance = ref<ClassicEditor | null>( null );

/**
 * Throws from a timeout, so that the error escapes as an uncaught one — the path a real error takes.
 * The editor is what ties it to this component; whatever is passed here is what the error is attributed to.
 *
 * Remove it in an actual integration; it exists only to give this demo something to report.
 */
function simulateError() {
	const editor = editorInstance.value;

	setTimeout( () => {
		throw new CKEditorError( 'demo-simulated-error', editor );
	} );
}
</script>

<style scoped>
.editor {
	flex: 1;
	min-width: 0;
}

.buttons {
	margin-bottom: 8px;
}
</style>
