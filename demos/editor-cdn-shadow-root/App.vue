<template>
  <h2>Using CKEditor 5 from CDN in a shadow root</h2>

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
  >
    <template #default="{ shadowRoot }">
      <CloudEditor
        v-model="data"
        :shadow-root="shadowRoot"
      />
    </template>
  </ShadowRootHost>

  <h2>Live editor data</h2>

  <textarea v-model="data" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ShadowRootHost from '../_internal/ShadowRootHost.vue';
import CloudEditor from './Editor.vue';

const MODES: Array<ShadowRootMode> = [ 'open', 'closed' ];

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

.controls {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
