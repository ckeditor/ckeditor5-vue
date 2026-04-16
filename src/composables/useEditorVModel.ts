/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ref, watch, type Ref, type EmitFn, type ModelRef } from 'vue';
import type { Editor, EventInfo } from 'ckeditor5';
import type { EditorWithAttachedWatchdog } from '../utils/wrapWithWatchdogIfPresent.js';

/**
 * Hook that synchronizes editor state with currently set vue model.
 */
export function useEditorVModel<TEditor extends Editor>(
	{
		emit,
		instance,
		model
	}: Attrs<TEditor>
): Result<TEditor> {
	const lastEditorData = ref<string>();

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

	return {
		lastEditorData,
		assignEditorDataToModel
	};
}

type Attrs<TEditor extends Editor> = {
	model: ModelRef<string>;
	emit: EmitFn<EditorVModelEvents<TEditor>>;
	instance: Ref<EditorWithAttachedWatchdog<TEditor> | undefined>;
};

type Result<TEditor extends Editor> = {
	lastEditorData: Ref<string | undefined>;
	assignEditorDataToModel( editor: TEditor, evt?: EventInfo | null ): void;
};

export type EditorVModelEvents<TEditor extends Editor> = {
	input: [ data: string, event: EventInfo | null, editor: TEditor ];
	'update:modelValue': [ data: string, event: EventInfo | null, editor: TEditor ];
};
