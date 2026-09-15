<template>
  <h2>CKEditor 5 error handling</h2>

  <p class="info">
    There is no Watchdog any more, so a crashed editor stays as it is instead of being silently rebuilt.
    These demos show what you get in its place.
  </p>

  <p class="info">
    Two ways to break something. <strong>Simulate an error</strong> throws an error that is reported and
    leaves the editor working — which is what most errors are like. Typing the word <strong>okoń</strong>
    inserts an element the schema does not know, and that editor stays broken for good: every later
    redraw fails again, so clicking around it keeps reporting. Under the Watchdog the first crash rebuilt
    the editor and the damage disappeared with it.
  </p>

  <div class="buttons">
    <button
      :disabled="demo === 'single'"
      @click="demo = 'single'"
    >
      One editor
    </button>
    <button
      :disabled="demo === 'two'"
      @click="demo = 'two'"
    >
      Two editors
    </button>
  </div>

  <p
    v-if="demo === 'two'"
    class="info"
  >
    An error belongs to the editor it came from. Break one and only that one reports.
  </p>

  <div
    :key="demo"
    class="editors"
  >
    <EditorPanel
      name="Editor 1"
      initial-data="<p>Type something here, then break it and see that this stays.</p>"
      @error="log"
    />
    <EditorPanel
      v-if="demo === 'two'"
      name="Editor 2"
      initial-data="<p>And something else here.</p>"
      @error="log"
    />
  </div>

  <h3>Reported errors</h3>
  <button
    class="clear-btn"
    @click="logs = []"
  >
    Clear
  </button>
  <ul class="logs">
    <li v-if="!logs.length">
      <em>Nothing reported yet.</em>
    </li>
    <li
      v-for="( entry, index ) in logs"
      :key="index"
    >
      {{ entry }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ClassicEditor } from 'ckeditor5';
import type { EditorErrorDescription } from '../../src/plugin.js';
import EditorPanel from './EditorPanel.vue';

const demo = ref<'single' | 'two'>( 'single' );
const logs = ref<Array<string>>( [] );

function log( name: string, error: Error, description: EditorErrorDescription<ClassicEditor> ) {
	const time = new Date().toLocaleTimeString();

	logs.value.unshift( `[${ time }] ${ name } · ${ description.phase } · ${ error.message.split( '\n' )[ 0 ] }` );
}
</script>

<style>
body {
	max-width: 900px;
	margin: 20px auto;
	font-family: sans-serif;
}

.info {
	color: #444;
}

.editors {
	display: flex;
	gap: 20px;
	align-items: flex-start;
}

.clear-btn {
	margin-bottom: 10px;
}

.logs {
	font-family: monospace;
	font-size: 0.9em;
	color: #333;
	background: #f4f4f4;
	padding: 10px 20px;
	border-radius: 4px;
	list-style-type: none;
	min-height: 60px;

	& > li {
		margin-bottom: 5px;
	}
}
</style>
