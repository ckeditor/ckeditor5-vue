<template>
  <component
    :is="tagName"
    ref="element"
  />
</template>

<script
	setup
	lang="ts"
	generic="TEditorConstructor extends EditorWithWatchdogRelaxedConstructor"
>
import {
	ref,
	onMounted,
	onBeforeUnmount,
	markRaw,
	type Raw,
} from 'vue';

import type { EditorConfig } from 'ckeditor5';
import type { EditorErrorDescription, EditorWithWatchdogRelaxedConstructor, Props } from './types.js';

import {
	assignElementToEditorConfig,
	assignInitialDataToEditorConfig,
	ExtractEditorType,
	getInstalledCKBaseFeatures
} from '@ckeditor/ckeditor5-integrations-common';

import { appendUsageDataPluginToConfig } from './plugins/appendUsageDataPluginToConfig.js';
import {
	destroyEditorWithWatchdog,
	unwrapEditorWatchdog,
	wrapWithWatchdogIfPresent,
	type EditorWithAttachedWatchdog
} from './utils/wrapWithWatchdogIfPresent.js';

import { useIsUnmounted } from './composables/useIsUnmounted.js';
import { EditorLifecycleEvents, useEditorLifecycleEvents } from './composables/useEditorLifecycleEvents.js';
import { EditorVModelEvents, useEditorVModel } from './composables/useEditorVModel.js';
import { toggleEditorReadOnly, useEditorReadOnly } from './composables/useEditorReadOnly.js';
import { useEditorVersionCheck } from './composables/useEditorVersionCheck.js';

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
		error: [ error: EditorErrorDescription<TEditor> ],
	}
>();

const element = ref<HTMLElement>();
const instance = ref<Raw<EditorWithAttachedWatchdog<TEditor>>>();
const isUnmounted = useIsUnmounted();

const { lastEditorData, assignEditorDataToModel } = useEditorVModel<TEditor>( {
	disableTwoWayDataBinding: () => props.disableTwoWayDataBinding,
	model,
	emit,
	instance
} );

useEditorLifecycleEvents( instance, emit );
useEditorReadOnly(instance, () => props.disabled);
useEditorVersionCheck();

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

	// Wrap editor with watchdog unless disabled.
	let Constructor = props.editor;

	if ( !props.disableWatchdog ) {
		Constructor = wrapWithWatchdogIfPresent( props.editor, props.watchdogConfig ) as TEditorConstructor;
	}

	try {
		const editor = await (
			supports.elementConfigAttachment ?
				Constructor.create( assignElementToEditorConfig( Constructor, element.value!, editorConfig ) ) :
				Constructor.create( element.value, editorConfig )
		) as unknown as EditorWithAttachedWatchdog<TEditor>;

		if ( isUnmounted.value ) {
			destroyEditorWithWatchdog( editor );
			return;
		}

		// Synchronize the editor content. The #modelValue may change while the editor is being created, so the editor content has
		// to be synchronized with these potential changes as soon as it is ready.
		if ( model.value !== prevModelValue ) {
			editor.data.set( model.value );
		}

		// If it's editor watchdog instance, then it attach error handlers.
		const watchdog = unwrapEditorWatchdog( editor );

		if ( watchdog ) {
			watchdog.on( 'error', ( _, { error, causesRestart } ) => {
				emit( 'error', {
					phase: 'runtime',
					watchdog,
					editor: watchdog.editor as TEditor,
					causesRestart,
					error
				} );
			} );

			watchdog.on( 'restart', () => {
				toggleEditorReadOnly( editor, props.disabled );

				instance.value = markRaw( editor );

				if ( !props.disableTwoWayDataBinding ) {
					assignEditorDataToModel( instance.value! );
				}
			} );
		}

		instance.value = markRaw( editor );
	} catch ( error: any ) {
		if ( isUnmounted.value ) {
			return;
		}

		console.error( error );
		emit( 'error', {
			phase: 'initialization',
			error
		} );
	}
} );

onBeforeUnmount( () => {
	if ( !instance.value ) {
		return;
	}

	destroyEditorWithWatchdog( instance.value );
	instance.value = undefined;
} );
</script>
