<template>
  <h2>CKEditor 5 Watchdog Demo</h2>

  <ckeditor
    v-model="data"
    tag-name="textarea"
    :editor="ClassicEditor"
    :config="config"
    :watchdog-config="{ crashNumberLimit: 10 }"
    :disable-watchdog="isWatchdogDisabled"
    @ready="onReady"
    @error="onError"
  />

  <button
    class="crash-btn"
    :disabled="!editorInstance"
    @click="crashEditor"
  >
    Crash editor
  </button>

  <p class="crash-instruction">
    Type the word <strong>okoń</strong> in the editor above to trigger a crash!
  </p>

  <h3>Data dump:</h3>
  <pre class="data-dump">{{ data }}</pre>

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
import { ref } from 'vue';
import {
	ClassicEditor,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	EditorConfig,
	Editor,
} from 'ckeditor5';
import type { EditorErrorDescription } from '../../src/plugin.js';
import { CrashOnMagicWordPlugin } from './CrashOnMagicWordPlugin.js';

const data = ref( '<p>Hello world! Watchdog is ready.</p>' );
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

const isWatchdogDisabled = ref( false );
const logs = ref<string[]>( [] );
const editorInstance = ref<any>( null );

function addLog( message: string ) {
	const time = new Date().toLocaleTimeString();

	logs.value.unshift( `[${ time }] ${ message }` );
}

function onReady( editor: Editor ) {
	editorInstance.value = editor;
	addLog( 'Editor is ready.' );
}

function crashEditor() {
	setTimeout( () => {
		const err: any = new Error( 'foo' );
		err.context = editorInstance.value;
		err.is = () => true;
		throw err;
	} );
}

function onError( error: Error, payload: EditorErrorDescription<ClassicEditor> ) {
	console.error( error, payload );

	if ( payload.phase === 'runtime' && payload.causesRestart ) {
		addLog( 'CRASH! Watchdog caught the error and is restarting the editor.' );
	} else {
		addLog( 'CRITICAL CRASH! Editor died and will not restart.' );
	}
}
</script>

<style>
body {
	max-width: 800px;
	margin: 20px auto;
	font-family: sans-serif;
}

.crash-btn {
	margin-top: 12px;
}

.crash-instruction {
	margin: 15px 0 20px;

	& > strong {
		color: #d9534f;
	}
}

.data-dump {
	font-family: monospace;
	font-size: 0.9em;
	color: #333;
	background: #eaf2f8;
	padding: 10px 20px;
	border-radius: 4px;
	white-space: pre-wrap;
	word-wrap: break-word;
	margin-bottom: 30px;
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
