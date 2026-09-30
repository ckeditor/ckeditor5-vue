<template>
  <div v-if="error">
    Error!
  </div>

  <div v-else-if="loading || !TestEditor">
    Loading...
  </div>

  <ckeditor
    v-else
    :model-value="modelValue"
    :editor="TestEditor"
    :config="config"
    @update:model-value="value => emit( 'update:modelValue', value )"
    @ready="onReady"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ClassicEditor, EditorConfig } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

import useCKEditorCloud from '../../src/useCKEditorCloud.js';

const props = defineProps<{
	modelValue: string;
	shadowRoot: ShadowRoot;
}>();

const emit = defineEmits<{
	( event: 'update:modelValue', value: string ): void;
}>();

const { data, loading, error } = useCKEditorCloud( {
	version: 'nightly',
	injectedStylesheetsLocation: {
		targetNode: props.shadowRoot,
		placement: 'end'
	}
} );

const config: EditorConfig = {
	licenseKey: import.meta.env.CKEDITOR_LICENSE_KEY ?? 'GPL',
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
};

const TestEditor = computed<typeof ClassicEditor | null>( () => {
	if ( !data.value ) {
		return null;
	}

	const {
		ClassicEditor: BaseEditor, Paragraph,
		Essentials, Heading, Bold, Italic
	} = data.value.CKEditor;

	return class TestEditor extends BaseEditor {
		public static builtinPlugins = [
			Essentials,
			Paragraph,
			Heading,
			Bold,
			Italic
		];
	};
} );

function onReady( editor: ClassicEditor ) {
	console.log( 'Editor is ready.', { editor } );
}
</script>
