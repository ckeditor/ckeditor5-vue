<template>
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
