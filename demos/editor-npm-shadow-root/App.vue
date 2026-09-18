<template>
  <h2>Using CKEditor 5 from NPM in a shadow root</h2>

  <p class="controls">
    <label>
      Shadow root mode
      <select v-model="mode">
        <option
          v-for="item in MODES"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>
    </label>
  </p>

  <ShadowRootHost
    :key="mode"
    :mode="mode"
    :adopted-style-sheets="styleSheets"
  >
    <ckeditor
      v-model="data"
      :editor="ClassicEditor"
      :config="config"
      @ready="onReady"
    />
  </ShadowRootHost>

  <h2>Live editor data</h2>

  <textarea v-model="data" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
	ClassicEditor, Bold, Essentials, Heading, Italic, Paragraph,
	type EditorConfig
} from 'ckeditor5';

import ShadowRootHost from '../_internal/ShadowRootHost.vue';
import { getCKEditorStyleSheet } from '../_internal/getCKEditorStyleSheet.js';

const MODES: Array<ShadowRootMode> = [ 'open', 'closed' ];

const mode = ref<ShadowRootMode>( 'open' );
const data = ref( '<p>Hello from a shadow root!</p>' );

const styleSheets = [ getCKEditorStyleSheet() ];

const config: EditorConfig = {
	licenseKey: import.meta.env.CKEDITOR_LICENSE_KEY ?? 'GPL',
	plugins: [ Essentials, Paragraph, Heading, Bold, Italic ],
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
};

function onReady( editor: ClassicEditor ) {
	console.log( 'Editor is ready.', { editor, mode: mode.value } );
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
	align-items: center;
	gap: 8px;
}
</style>
