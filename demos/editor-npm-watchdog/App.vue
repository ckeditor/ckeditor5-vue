<template>
  <h2>CKEditor 5 Watchdog Demo</h2>

  <div class="toolbar">
    <button @click="toggleWatchdog">
      {{ isWatchdogDisabled ? 'Enable' : 'Disable' }} Watchdog
    </button>
  </div>

  <ckeditor
    :key="componentKey"
    v-model="data"
    tag-name="textarea"
    :editor="TestEditor"
    :config="config"
    :disable-watchdog="isWatchdogDisabled"
    @ready="onReady"
    @error="onError"
  />

  <p class="crash-instruction">
    Type the word <strong>okoń</strong> in the editor above to trigger a crash!
  </p>

  <h3>Logs:</h3>
  <ul class="logs">
    <li
      v-for="(log, index) in logs"
      :key="index"
    >
      {{ log }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
	ClassicEditor,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic
} from 'ckeditor5';
import { CrashOnMagicWordPlugin } from './CrashOnMagicWordPlugin.js';

class TestEditor extends ClassicEditor {
	static builtinPlugins = [
		Essentials,
		Paragraph,
		Heading,
		Bold,
		Italic,
		CrashOnMagicWordPlugin
	];
}

const data = ref( '<p>Hello world! Watchdog is ready.</p>' );
const config = reactive( {
	licenseKey: 'GPL',
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
} );

const isWatchdogDisabled = ref( false );
const componentKey = ref( 0 );
const logs = ref<string[]>( [] );

function addLog( message: string ) {
	const time = new Date().toLocaleTimeString();
	logs.value.unshift( `[${ time }] ${ message }` );
}

function toggleWatchdog() {
	isWatchdogDisabled.value = !isWatchdogDisabled.value;
	componentKey.value += 1;

	addLog( `Component reloaded. Watchdog is now ${ isWatchdogDisabled.value ? 'DISABLED' : 'ENABLED' }.` );
}

function onReady() {
	addLog( 'Editor is ready.' );
}

function onError( payload: any ) {
	if ( payload.causesRestart ) {
		addLog( 'CRASH! Watchdog caught the error and is restarting the editor.' );
	} else {
		addLog( 'CRITICAL CRASH! Editor died and will not restart (Watchdog disabled).' );
	}
}
</script>

<style>
body {
	max-width: 800px;
	margin: 20px auto;
	font-family: sans-serif;
}

.toolbar {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 40px 0 20px;
}

.crash-instruction {
	margin: 15px 0 40px;

	& > strong {
		color: #d9534f;
	}
}

.logs {
	font-family: monospace;
	font-size: 0.9em;
	color: #333;
	background: #f4f4f4;
	padding: 10px 20px;
	border-radius: 4px;
	list-style-type: none;
	height: 150px;
	overflow-y: auto;

	& > li {
		margin-bottom: 5px;
	}
}
</style>
