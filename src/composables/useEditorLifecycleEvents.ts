/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, EventInfo } from 'ckeditor5';
import { watch, type Ref, type EmitFn } from 'vue';

/**
 * Hook that watches editor lifecycle events and maps them to Vue event emitters.
 */
export function useEditorLifecycleEvents<TEditor extends Editor>(
	instance: Ref<TEditor | undefined>,
	emit: EmitFn<EditorLifecycleEvents<TEditor>>
): void {
	watch( instance, newInstance => {
		/* istanbul ignore if -- @preserve - Defensive check, instance never becomes undefined. */
		if ( !newInstance ) {
			return;
		}

		const { document } = newInstance.editing.view;

		document.on( 'focus', ( evt: EventInfo ) => emit( 'focus', evt, newInstance ) );
		document.on( 'blur', ( evt: EventInfo ) => emit( 'blur', evt, newInstance ) );

		// Let the world know the editor is ready.
		emit( 'ready', newInstance );

		newInstance.once( 'destroy', () => {
			emit( 'destroy', newInstance );
		} );
	}, { flush: 'post' } );
}

export type EditorLifecycleEvents<TEditor extends Editor> = {
	ready: [ editor: TEditor ];
	destroy: [ editor: TEditor ];
	blur: [ event: EventInfo, editor: TEditor ];
	focus: [ event: EventInfo, editor: TEditor ];
};
