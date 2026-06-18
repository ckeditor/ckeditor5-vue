<template>
  <div class="demo-root">
    <header class="demo-header">
      <h1 class="demo-title">
        CKEditor 5 · Multi-root Real-Time Collaboration
      </h1>
      <p class="demo-subtitle">
        Two independent editor clients connected to the same document.
        Add and remove roots on either side - changes sync instantly via Cloud Services.
      </p>
    </header>

    <div class="demo-editors-wrap">
      <section class="demo-editor-panel">
        <div class="demo-editor-header">
          <h2 class="demo-editor-label">
            Client A
          </h2>
        </div>
        <RTCEditor @ready="exposeFirstEditor" />
      </section>

      <div
        class="demo-divider"
        aria-hidden="true"
      />

      <section class="demo-editor-panel">
        <div class="demo-editor-header">
          <h2 class="demo-editor-label">
            Client B
          </h2>
        </div>
        <RTCEditor @ready="exposeSecondEditor" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import RTCEditor from './RTCEditor.vue';

declare global {
	interface Window {
		editor1?: unknown;
		editor2?: unknown;
	}
}

function exposeFirstEditor( editor: unknown ) {
	window.editor1 = editor;
}

function exposeSecondEditor( editor: unknown ) {
	window.editor2 = editor;
}
</script>
