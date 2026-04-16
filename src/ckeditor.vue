<template>
  <component
    :is="tagName"
    ref="element"
  />
</template>

<script
	setup
	lang="ts"
	generic="
		TEditorConstructor extends EditorWithWatchdogRelaxedConstructor<TEditor>,
		TEditor extends Editor
	"
>
import {
	ref,
	watch,
	markRaw,
	onMounted,
	onBeforeUnmount
} from 'vue';

import type { Editor, EditorConfig } from 'ckeditor5';
import type { EditorErrorDescription, EditorWithWatchdogRelaxedConstructor, Props } from './types.js';

import {
	appendExtraPluginsToEditorConfig,
	assignElementToEditorConfig,
	assignInitialDataToEditorConfig,
	compareInstalledCKBaseVersion,
	getInstalledCKBaseFeatures
} from '@ckeditor/ckeditor5-integrations-common';

import { appendAllIntegrationPluginsToConfig } from './plugins/appendAllIntegrationPluginsToConfig.js';
import {
	type EditorWithAttachedWatchdog,
	unwrapEditorWatchdog,
	wrapWithWatchdogIfPresent
} from './utils/wrapWithWatchdogIfPresent.js';

import { EditorInstanceLifecycleEmitters, useVueEditorLifecycleEmitterPlugin } from './composables/useVueEmitterEditorPlugin.js';
import { useIsUnmounted } from './composables/useIsUnmounted.js';

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
	& EditorInstanceLifecycleEmitters<TEditor>
	& {
		ready: [ editor: TEditor ],
		destroy: [],
		error: [ error: EditorErrorDescription<TEditor> ],
	}
>();

const VUE_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from Vue integration (@ckeditor/ckeditor5-vue)';

const element = ref<HTMLElement>();
const instance = ref<EditorWithAttachedWatchdog<TEditor>>();
const isUnmounted = useIsUnmounted();
const {
	lastEditorData,
	VueEmitterIntegrationPlugin
} = useVueEditorLifecycleEmitterPlugin<TEditor>(emit, () => props.disableTwoWayDataBinding);

defineExpose( {
	instance,
	lastEditorData
} );

watch( model, newModel => {
	// Synchronize changes of #modelValue. There are two sources of changes:
	//
	//                External modelValue change      ──────╮
	//                                                      ╰─────> ┏━━━━━━━━━━━┓
	//                                                              ┃ Component ┃
	//                                                      ╭─────> ┗━━━━━━━━━━━┛
	//                   Internal data change         ──────╯
	//             (typing, commands, collaboration)
	//
	// Case 1: If the change was external (via props), the editor data must be synced with
	// the component using instance#setData() and it is OK to destroy the selection.
	//
	// Case 2: If the change is the result of internal data change, the #modelValue is the
	// same as this.lastEditorData, which has been cached on #change:data. If we called
	// instance#setData() at this point, that would demolish the selection.
	//
	// To limit the number of instance#setData() which is time-consuming when there is a
	// lot of data we make sure:
	//    * the new modelValue is at least different than the old modelValue (Case 1.)
	//    * the new modelValue is different than the last internal instance state (Case 2.)
	//
	// See: https://github.com/ckeditor/ckeditor5-vue/issues/42.
	if ( instance.value && newModel !== lastEditorData.value ) {
		instance.value.data.set( newModel );
	}
} );

watch( () => props.disabled, readOnlyMode => {
	if ( readOnlyMode ) {
		instance.value!.enableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
	} else {
		instance.value!.disableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
	}
} );

function checkVersion(): void {
	switch ( compareInstalledCKBaseVersion( '42.0.0' ) ) {
		case null:
			console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
			break;

		case -1:
			console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.' );
			break;
	}
}

checkVersion();

onMounted( async () => {
	const supports = getInstalledCKBaseFeatures();

	// Clone the config first so it never gets mutated (across multiple editor instances).
	// https://github.com/ckeditor/ckeditor5-vue/issues/101
	let editorConfig: EditorConfig = appendAllIntegrationPluginsToConfig(
		Object.assign( {}, props.config )
	);

	let prevModelValue = model.value;

	if ( model.value ) {
		editorConfig = assignInitialDataToEditorConfig( editorConfig, model.value, true );
	}

	// Wrap editor with watchdog unless disabled.
	let Constructor = props.editor;

	if ( !props.disableWatchdog ) {
		Constructor = wrapWithWatchdogIfPresent( props.editor ) as TEditorConstructor;
	}

	try {
		editorConfig = appendExtraPluginsToEditorConfig( editorConfig, [ VueEmitterIntegrationPlugin ] );

		const editor = await (
			supports.elementConfigAttachment ?
				Constructor.create( assignElementToEditorConfig( Constructor, element.value!, editorConfig ) ) :
				Constructor.create( element.value, editorConfig )
		);

		if ( isUnmounted.value ) {
			editor.destroy();
			return;
		}

		// Save the reference to the instance for further use.
		instance.value = markRaw( editor );

		// Synchronize the editor content. The #modelValue may change while the editor is being created, so the editor content has
		// to be synchronized with these potential changes as soon as it is ready.
		if ( model.value !== prevModelValue ) {
			editor.data.set( model.value );
		}

		// Set initial disabled state.
		if ( props.disabled ) {
			editor.enableReadOnlyMode( VUE_INTEGRATION_READ_ONLY_LOCK_ID );
		}

		// Let the world know the editor is ready.
		emit( 'ready', editor );

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
				instance.value = watchdog.editor! as EditorWithAttachedWatchdog<TEditor>;
			} );
		}
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
	if ( instance.value ) {
		const watchdog = unwrapEditorWatchdog( instance.value );

		if ( watchdog ) {
			// If watchdog is present on the editor, then destroy the watchdog. It'll automatically kill assigned editors.
			watchdog.destroy();
		} else {
			// If there is no watchdog, kill the editor.
			instance.value.destroy();
		}

		instance.value = undefined;
	}

	// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
	// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
	emit( 'destroy' );
} );
</script>
