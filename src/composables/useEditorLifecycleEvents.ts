/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, EventInfo, PluginConstructor } from 'ckeditor5';
import { toValue, type EmitFn, type MaybeRefOrGetter } from 'vue';

import { useIsUnmounted } from './useIsUnmounted.js';
import { debounce } from 'lodash-es';

const INPUT_EVENT_DEBOUNCE_WAIT = 300;

/**
 * Hook that watches editor lifecycle events and maps them to Vue event emitters.
 */
export function useEditorLifecycleEvents<TEditor extends Editor>(
	{
		emit,
		disableTwoWayDataBinding,
		onBeforeReady,
		onDataChange
	}: Attrs<TEditor>
): PluginConstructor {
	const isUnmounted = useIsUnmounted();

	/**
	 * Plugin that registers editor event listeners (focus, blur, data changes).
	 */
	function VueEmitterIntegrationPlugin( editor: TEditor ) {
		// Use the leading edge so the first event in the series is emitted immediately.
		// Failing to do so leads to race conditions, for instance, when the component modelValue
		// is set twice in a time span shorter than the debounce time.
		// See https://github.com/ckeditor/ckeditor5-vue/issues/149.
		const emitDebouncedInputEvent = debounce( ( evt: EventInfo ) => {
			if ( toValue( disableTwoWayDataBinding ) || isUnmounted.value ) {
				return;
			}

			onDataChange( editor, evt );
		}, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );

		editor.once( 'ready', () => {
			const { model, editing } = editor;

			// Debounce emitting the #input event. When data is huge, instance#getData()
			// takes a lot of time to execute on every single key press and ruins the UX.
			//
			// See: https://github.com/ckeditor/ckeditor5-vue/issues/42
			model.document.on( 'change:data', emitDebouncedInputEvent );

			editing.view.document.on( 'focus', ( evt: EventInfo ) => emit( 'focus', evt, editor ) );
			editing.view.document.on( 'blur', ( evt: EventInfo ) => emit( 'blur', evt, editor ) );

			// Let the world know the editor is ready.
			onBeforeReady( editor );
			emit( 'ready', editor );
		} );

		editor.once( 'destroy', () => {
			emitDebouncedInputEvent.cancel();
			emit( 'destroy', editor );
		} );
	}

	return VueEmitterIntegrationPlugin as PluginConstructor;
}

type Attrs<TEditor extends Editor> = {
	emit: EmitFn<EditorLifecycleEvents<TEditor>>;
	disableTwoWayDataBinding: MaybeRefOrGetter<boolean>;
	onBeforeReady: ( editor: TEditor ) => void;
	onDataChange: ( editor: TEditor, evt: EventInfo ) => void;
};

export type EditorLifecycleEvents<TEditor extends Editor> = {
	ready: [ editor: TEditor ];
	destroy: [ editor: TEditor ];
	blur: [ event: EventInfo, editor: TEditor ];
	focus: [ event: EventInfo, editor: TEditor ];
};
