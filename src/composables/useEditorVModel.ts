/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, EventInfo } from 'ckeditor5';
import { debounce } from 'lodash-es';
import {
	ref, watch, toValue,
	type Ref, type EmitFn, type ModelRef, type MaybeRefOrGetter
} from 'vue';

import { useIsUnmounted } from './useIsUnmounted.js';

const INPUT_EVENT_DEBOUNCE_WAIT = 300;

/**
 * Hook that synchronizes editor state with currently set vue model.
 */
export function useEditorVModel<TEditor extends Editor>(
	{
		disableTwoWayDataBinding,
		emit,
		instance,
		model
	}: Attrs<TEditor>
): Result<TEditor> {
	const lastEditorData = ref<string>();
	const isUnmounted = useIsUnmounted();

	/**
	 * Updates the internal cache and emits Vue-compatible events.
	 */
	function assignEditorDataToModel( editor: TEditor, evt: EventInfo | null = null ) {
		const data = lastEditorData.value = editor.data.get();

		emit( 'update:modelValue', data, evt, editor );
		emit( 'input', data, evt, editor );
	}

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

	watch( instance, ( newInstance, _oldInstance, onCleanup ) => {
		if ( !newInstance ) {
			return;
		}

		const emitDebouncedInputEvent = debounce( ( evt: EventInfo ) => {
			if ( toValue( disableTwoWayDataBinding ) || isUnmounted.value ) {
				return;
			}

			assignEditorDataToModel( newInstance, evt );
		}, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );

		// Debounce emitting the #input event. When data is huge, instance#getData()
		// takes a lot of time to execute on every single key press and ruins the UX.
		//
		// See: https://github.com/ckeditor/ckeditor5-vue/issues/42
		newInstance.model.document.on( 'change:data', emitDebouncedInputEvent );

		newInstance.once( 'destroy', () => {
			emitDebouncedInputEvent.cancel();
		} );

		onCleanup( () => {
			emitDebouncedInputEvent.cancel();
		} );
	} );

	return {
		lastEditorData,
		assignEditorDataToModel
	};
}

type Attrs<TEditor extends Editor> = {
	disableTwoWayDataBinding: MaybeRefOrGetter<boolean>;
	model: ModelRef<string>;
	emit: EmitFn<EditorVModelEvents<TEditor>>;
	instance: Ref<TEditor | undefined>;
};

type Result<TEditor extends Editor> = {
	lastEditorData: Ref<string | undefined>;
	assignEditorDataToModel( editor: TEditor, evt?: EventInfo | null ): void;
};

export type EditorVModelEvents<TEditor extends Editor> = {
	input: [ data: string, event: EventInfo | null, editor: TEditor ];
	'update:modelValue': [ data: string, event: EventInfo | null, editor: TEditor ];
};
