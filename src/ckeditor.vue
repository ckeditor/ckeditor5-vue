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
	getCurrentInstance,
	computed,
} from 'vue';

import type { CKEditorError, EditorConfig } from 'ckeditor5';
import type { EditorErrorDescription, EditorWithWatchdogRelaxedConstructor, Props } from './types.js';

import {
	assignElementToEditorConfig,
	assignInitialDataToEditorConfig,
	ExtractEditorType,
	getInstalledCKBaseFeatures
} from '@ckeditor/ckeditor5-integrations-common';

import { appendUsageDataPluginToConfig } from './plugins/VueIntegrationUsageDataPlugin.js';
import { cleanupOrphanEditorElements } from './utils/cleanupOrphanEditorElements.js';
import {
	destroyEditorWithWatchdog,
	unwrapEditorWatchdog,
	wrapWithWatchdogIfPresent,
	type EditorWithAttachedWatchdog
} from './utils/wrapWithWatchdogIfPresent.js';

import { useIsUnmounted } from './composables/useIsUnmounted.js';
import { EditorLifecycleEvents, useEditorLifecycleEvents } from './composables/useEditorLifecycleEvents.js';
import { EditorVModelEvents, useEditorVModel } from './composables/useEditorVModel.js';
import { useEditorReadOnly } from './composables/useEditorReadOnly.js';
import { useEditorVersionCheck } from './composables/useEditorVersionCheck.js';

type TEditor = ExtractEditorType<TEditorConstructor>;

defineOptions( {
	name: 'CKEditor'
} );

const model = defineModel( 'modelValue', { type: String, default: '' } );
const props = withDefaults( defineProps<Props<TEditorConstructor>>(), {
	config: () => ( {} ),
	tagName: 'div',
	disableWatchdog: false,
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

const element = ref<HTMLElement>();
const instance = ref<Raw<EditorWithAttachedWatchdog<TEditor>>>();
const isUnmounted = useIsUnmounted();

const { lastEditorData, assignEditorDataToModel } = useEditorVModel<TEditor>( {
	disableTwoWayDataBinding: () => props.disableTwoWayDataBinding,
	model,
	emit,
	instance
} );

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
				if ( isUnmounted.value ) {
					return;
				}

				if ( !hasErrorHandler() ) {
					console.error( error );
				}

				emit( 'error', error, {
					phase: 'runtime',
					watchdog,
					editor: watchdog.editor as TEditor,
					causesRestart
				} );
			} );

			watchdog.on( 'restart', () => {
				// Sometimes editor leave a lot of orphaned elements. Try to remove them.
				try {
					cleanupOrphanEditorElements( instance.value! );
				} catch ( err ) {
					console.error( err );
				}

				if  ( !isUnmounted.value ) {
					instance.value = markRaw( watchdog.editor! as TEditor );

					// Rewind vue model back to old working state.
					assignEditorDataToModel( instance.value );
				}
			} );
		}

		instance.value = markRaw( editor );
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

onBeforeUnmount( () => {
	if ( !instance.value ) {
		return;
	}

	destroyEditorWithWatchdog( instance.value );
	instance.value = undefined;
} );
</script>
