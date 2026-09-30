<template>
  <p class="shadow-root-mode-select">
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
</template>

<script setup lang="ts">
const MODES: Array<ShadowRootMode> = [ 'open', 'closed' ];

const mode = defineModel<ShadowRootMode>( { default: 'open' } );
</script>

<style scoped>
.shadow-root-mode-select {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
