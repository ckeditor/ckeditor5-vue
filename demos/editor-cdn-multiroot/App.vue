<template>
  <h1>CKEditor 5 &ndash; multi-root editor &ndash; CDN Vue development sample</h1>

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

  <p
    v-if="cloud.loading.value"
    class="info"
  >
    Loading CKEditor 5 from CDN...
  </p>

  <p
    v-else-if="cloud.error.value"
    class="info"
  >
    CKEditor 5 could not be loaded from CDN.
  </p>

  <template v-else-if="MultiRootEditor">
    <MultiRootEditorDemo
      v-if="demo == 'editor'"
      :editor="MultiRootEditor"
      :data="multiRootEditorContent"
      :roots-attributes="rootsAttributes"
    />

    <MultiRootEditorRichDemo
      v-else
      :editor="MultiRootEditor"
      :data="multiRootEditorContent"
      :roots-attributes="rootsAttributes"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MultiRootEditor as MultiRootEditorType } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

import useCKEditorCloud from '../../src/useCKEditorCloud.js';
import type {
	MultiRootEditorData,
	MultiRootEditorRootsAttributes
} from '../../src/plugin.js';

import MultiRootEditorDemo from './MultiRootEditorDemo.vue';
import MultiRootEditorRichDemo from './MultiRootEditorRichDemo.vue';
import { createCKCdnMultiRootEditor } from './useCKCdnMultiRootEditor.js';

type Demo = 'editor' | 'rich';

const demo = ref<Demo>( 'editor' );
const cloud = useCKEditorCloud( {
	version: '43.0.0',
	translations: [ 'de' ],
	premium: true
} );

const MultiRootEditor = computed<typeof MultiRootEditorType | null>( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	return createCKCdnMultiRootEditor( cloud.data.value );
} );

const multiRootEditorContent: MultiRootEditorData = {
	intro: '<h2>Sample</h2><p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">multi-root editor build</a>.</p>',
	content: '<p>It is the custom content</p><figure class="image"><img src="/demos/sample.jpg" alt="CKEditor 5 Sample image."></figure>',
	outro: '<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>'
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
