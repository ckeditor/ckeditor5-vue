/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, EventInfo, PluginConstructor } from 'ckeditor5';
import { ref, type Ref, type EmitFn } from 'vue';

import { useIsUnmounted } from './useIsUnmounted.js';
import { debounce } from 'lodash-es';

const INPUT_EVENT_DEBOUNCE_WAIT = 300;
const INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from Vue integration (@ckeditor/ckeditor5-vue)';

/**
 * Hook that watches editor lifecycle events and maps them to Vue event emitters.
 */
export function useEditorEventsEmitter<TEditor extends Editor>(
	emit: EmitFn<EditorEmitterEvents<TEditor>>,
	props: {
		disableTwoWayDataBinding?: boolean;
		disabled?: boolean;
	}
): Result<TEditor> {
	const isUnmounted = useIsUnmounted();
	const lastEditorData = ref<string>();

	/**
	 * Retrieves data from the editor, updates the cache, and emits events for `v-model`.
	 */
	function assignEditorDataToModel( editor: TEditor, evt: EventInfo | null = null ) {
		// Cache the last editor data. This kind of data is a result of typing,
		// editor command execution, collaborative changes to the document, etc.
		// This data is compared when the component modelValue changes in a 2-way binding.
		const data = lastEditorData.value = editor.data.get();

		// The compatibility with the v-model and general Vue.js concept of input–like components.
		emit( 'update:modelValue', data, evt, editor );
		emit( 'input', data, evt, editor );
	}

	/**
	 * Plugin that registers editor event listeners (focus, blur, data changes).
	 */
	function VueEmitterIntegrationPlugin( editor: TEditor ) {
		// Use the leading edge so the first event in the series is emitted immediately.
		// Failing to do so leads to race conditions, for instance, when the component modelValue
		// is set twice in a time span shorter than the debounce time.
		// See https://github.com/ckeditor/ckeditor5-vue/issues/149.
		const emitDebouncedInputEvent = debounce( ( evt: EventInfo ) => {
			if ( props.disableTwoWayDataBinding || isUnmounted.value ) {
				return;
			}

			assignEditorDataToModel( editor, evt );
		}, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );

		editor.once( 'ready', () => {
			const { model, editing } = editor;

			// Debounce emitting the #input event. When data is huge, instance#getData()
			// takes a lot of time to execute on every single key press and ruins the UX.
			//
			// See: https://github.com/ckeditor/ckeditor5-vue/issues/42
			model.document.on( 'change:data', emitDebouncedInputEvent );

			editing.view.document.on( 'focus', ( evt: EventInfo ) => {
				emit( 'focus', evt, editor );
			} );

			editing.view.document.on( 'blur', ( evt: EventInfo ) => {
				emit( 'blur', evt, editor );
			} );

			if ( props.disabled ) {
				editor.enableReadOnlyMode( INTEGRATION_READ_ONLY_LOCK_ID );
			}

			// Let the world know the editor is ready.
			emit( 'ready', editor );
		} );

		editor.on( 'destroy', () => {
			emitDebouncedInputEvent.cancel();
			emit( 'destroy', editor );
		} );
	}

	return {
		lastEditorData,
		assignEditorDataToModel,
		VueEmitterIntegrationPlugin: VueEmitterIntegrationPlugin as PluginConstructor
	};
}

type Result<TEditor extends Editor> = {
	lastEditorData: Ref<string | undefined>;
	assignEditorDataToModel: ( editor: TEditor, evt?: EventInfo | null ) => void;
	VueEmitterIntegrationPlugin: PluginConstructor;
};

export type EditorEmitterEvents<TEditor extends Editor> = {
	ready: [ editor: TEditor ];
	destroy: [ editor: TEditor ];
	blur: [ event: EventInfo, editor: TEditor ];
	focus: [ event: EventInfo, editor: TEditor ];
	input: [ data: string, event: EventInfo | null, editor: TEditor ];
	'update:modelValue': [ data: string, event: EventInfo | null, editor: TEditor ];
};
