<template>
  <!-- `<Suspense>` is an experimental feature in Vue.js, so use it at your own risk -->
  <Suspense>
    <Editor />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import Editor from './Editor.vue';
</script>
