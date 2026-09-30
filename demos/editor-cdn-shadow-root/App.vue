<template>
  <h2>Using CKEditor 5 from CDN in a shadow root</h2>

  <ShadowRootModeSelect v-model="mode" />

  <ShadowRootHost
    v-slot="{ shadowRoot }"
    :key="mode"
    :mode="mode"
  >
    <CloudEditor
      v-model="data"
      :shadow-root="shadowRoot"
    />
  </ShadowRootHost>

  <h2>Live editor data</h2>

  <textarea v-model="data" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ShadowRootHost from '../_internal/ShadowRootHost.vue';
import ShadowRootModeSelect from '../_internal/ShadowRootModeSelect.vue';
import CloudEditor from './Editor.vue';

const mode = ref<ShadowRootMode>( 'open' );
const data = ref( '<p>Hello from a shadow root!</p>' );
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
</style>
