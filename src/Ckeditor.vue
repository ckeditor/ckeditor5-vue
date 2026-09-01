<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <DynamicElement
    ref="editorElementRef"
    :definition="elementDefinition"
  />
</template>

<script
	setup
	lang="ts"
	generic="TEditorConstructor extends EditorRelaxedConstructor & WithErrorReporting"
>
import {
	ref,
	onMounted,
	onBeforeUnmount,
	markRaw,
	type Raw,
	getCurrentInstance
} from 'vue';

import type { CKEditorError, EditorConfig } from 'ckeditor5';
import type { EditorErrorDescription, Props, WithErrorReporting } from './types.js';

import {
	assignElementToEditorConfig,
	assignInitialDataToEditorConfig,
	getInstalledCKBaseFeatures,
	type EditorRelaxedConstructor,
	type ExtractEditorType
} from '@ckeditor/ckeditor5-integrations-common';

import { appendUsageDataPluginToConfig } from './plugins/VueIntegrationUsageDataPlugin.js';

import { useIsUnmounted } from './composables/useIsUnmounted.js';
import { EditorLifecycleEvents, useEditorLifecycleEvents } from './composables/useEditorLifecycleEvents.js';
import { EditorVModelEvents, useEditorVModel } from './composables/useEditorVModel.js';
import { useEditorReadOnly } from './composables/useEditorReadOnly.js';
import { useEditorVersionCheck } from './composables/useEditorVersionCheck.js';
import { useEditorElementDefinition } from './composables/useEditorElementDefinition.js';
import DynamicElement from './DynamicElement.vue';

type TEditor = ExtractEditorType<TEditorConstructor>;

defineOptions( {
	name: 'CKEditor'
} );

const model = defineModel( 'modelValue', { type: String, default: '' } );
const props = withDefaults( defineProps<Props<TEditorConstructor>>(), {
	config: () => ( {} ),
	tagName: 'div',
	disabled: false,
	disableTwoWayDataBinding: false
} );

const emit = defineEmits<
	& EditorLifecycleEvents<TEditor>
	& EditorVModelEvents<TEditor>
	& {
		error: [ error: Error | CKEditorError, description: EditorErrorDescription<TEditor> ],
	}
>();

const currentInstance = getCurrentInstance();
const hasErrorHandler = () => !!currentInstance?.vnode.props?.onError;

const editorElementRef = ref<InstanceType<typeof DynamicElement>>();

// Unregisters the error reporting callback when the editor goes away.
let offEditorError: ( () => void ) | null = null;
const instance = ref<Raw<TEditor>>();
const isUnmounted = useIsUnmounted();

const { lastEditorData } = useEditorVModel<TEditor>( {
	disableTwoWayDataBinding: () => props.disableTwoWayDataBinding,
	model,
	emit,
	instance
} );

const elementDefinition = useEditorElementDefinition({
	Editor: () => props.editor,
	config: () => props.config,
	defaultElementName: () => props.tagName
});

useEditorVersionCheck();
useEditorLifecycleEvents( instance, emit );
useEditorReadOnly( instance, () => props.disabled );

defineExpose( {
	instance,
	lastEditorData
} );

onMounted( async () => {
	const supports = getInstalledCKBaseFeatures();

	// Clone the config first so it never gets mutated (across multiple editor instances).
	// https://github.com/ckeditor/ckeditor5-vue/issues/101
	let editorConfig: EditorConfig = appendUsageDataPluginToConfig( { ...props.config } );

	// Store model value before initialization to verify if it changed in the meantime.
	let prevModelValue = model.value;

	if ( model.value ) {
		editorConfig = assignInitialDataToEditorConfig( editorConfig, model.value, true );
	}

	try {
		const domElement = editorElementRef.value?.elementRef;

		if ( !domElement ) {
			throw new Error( 'Editor element is not available. Make sure the component is mounted.' );
		}

		const editor = await (
			supports.elementConfigAttachment ?
				props.editor.create( assignElementToEditorConfig( props.editor, domElement, editorConfig ) ) :
				props.editor.create( domElement, editorConfig )
		) as unknown as TEditor;

		if ( isUnmounted.value ) {
			await editor.destroy();
			return;
		}

		// Synchronize the editor content. The #modelValue may change while the editor is being created, so the editor content has
		// to be synchronized with these potential changes as soon as it is ready.
		if ( model.value !== prevModelValue ) {
			editor.data.set( model.value );
		}

		// Held before anything else runs, so that whatever happens next the editor is still destroyed
		// when the component goes away.
		instance.value = markRaw( editor );

		// The runtime half of the `error` event. The other half is the rejected `create()` below, and both
		// are needed: reporting only covers an editor that is already running.
		// Off the editor class rather than imported: importing a value from CKEditor loads the npm build,
		// and an application that meant to load it from a CDN is then refused.
		offEditorError = props.editor.onEditorError( ( { error, source } ) => {
			// One registration serves the whole page, so every component hears about every editor. This is
			// what keeps an error with the component whose editor it came from.
			if ( source !== editor || isUnmounted.value ) {
				return;
			}

			if ( !hasErrorHandler() ) {
				console.error( error );
			}

			emit( 'error', error, {
				phase: 'runtime',
				editor
			} );
		} );

	} catch ( error: any ) {
		if ( isUnmounted.value ) {
			return;
		}

		if ( !hasErrorHandler() ) {
			console.error( error );
		}

		emit( 'error', error, {
			phase: 'initialization'
		} );
	}
} );

onBeforeUnmount( async () => {
	offEditorError?.();
	offEditorError = null;

	const editor = instance.value;

	if ( !editor ) {
		return;
	}

	instance.value = undefined;

	await editor.destroy();
} );
</script>
