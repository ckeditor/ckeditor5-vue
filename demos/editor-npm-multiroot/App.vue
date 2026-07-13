<template>
  <h1>CKEditor 5 &ndash; multi-root editor &ndash; Vue development sample</h1>

  <div
    class="buttons"
    style="text-align: center;"
  >
    <button
      :disabled="demo == 'editor'"
      @click="demo = 'editor'"
    >
      Editor demo
    </button>

    <button
      :disabled="demo == 'rich'"
      @click="demo = 'rich'"
    >
      Rich integration demo
    </button>
  </div>

  <MultiRootEditorDemo
    v-if="demo == 'editor'"
    :data="multiRootEditorContent"
    :roots-attributes="rootsAttributes"
  />

  <MultiRootEditorRichDemo
    v-else
    :data="multiRootEditorContent"
    :roots-attributes="rootsAttributes"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type {
	MultiRootEditorData,
	MultiRootEditorRootsAttributes
} from '../../src/plugin.js';

import MultiRootEditorDemo from './MultiRootEditorDemo.vue';
import MultiRootEditorRichDemo from './MultiRootEditorRichDemo.vue';

type Demo = 'editor' | 'rich';

const demo = ref<Demo>( 'editor' );

const multiRootEditorContent: MultiRootEditorData = {
	intro: '<h2>Sample</h2><p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html">multi-root editor type</a>.</p>',
	content: '<p>It is the custom content</p><figure class="image"><img src="/demos/sample.jpg" alt="CKEditor 5 Sample image."></figure>',
	outro: '<p>You can use <a href="https://ckeditor.com/ckeditor-5/builder/">CKEditor Builder</a>' +
		' to create a custom configuration with your favorite features.</p>'
};

const rootsAttributes: MultiRootEditorRootsAttributes = {
	intro: {
		row: '1',
		order: 10
	},
	content: {
		row: '1',
		order: 20
	},
	outro: {
		row: '2',
		order: 10
	}
};
</script>
