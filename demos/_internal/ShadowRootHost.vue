<template>
  <div ref="host" />

  <Teleport
    v-if="target && shadowRoot"
    :to="target"
  >
    <slot :shadow-root="shadowRoot" />
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, shallowRef, useTemplateRef } from 'vue';

const props = withDefaults(
	defineProps<{
		mode?: ShadowRootMode;
		adoptedStyleSheets?: Array<CSSStyleSheet>;
	}>(),
	{
		mode: 'open',
		adoptedStyleSheets: () => []
	}
);

const host = useTemplateRef<HTMLDivElement>( 'host' );
const shadowRoot = shallowRef<ShadowRoot | null>( null );
const target = shallowRef<HTMLElement | null>( null );

onMounted( () => {
	const root = host.value!.attachShadow( { mode: props.mode } );

	root.adoptedStyleSheets = props.adoptedStyleSheets;

	shadowRoot.value = root;
	target.value = root.appendChild( document.createElement( 'div' ) );
} );

defineExpose( { shadowRoot } );
</script>
