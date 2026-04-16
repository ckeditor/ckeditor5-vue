/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConstructor } from '@ckeditor/ckeditor5-integrations-common';
import type { EditorWithWatchdogRelaxedConstructor } from '../types.js';
import type { Editor, EditorWatchdog } from 'ckeditor5';

const EDITOR_WATCHDOG_SYMBOL = Symbol.for( 'vue-editor-watchdog' );

export type EditorWithAttachedWatchdog<TEditor extends Editor = Editor> = TEditor & {
	[EDITOR_WATCHDOG_SYMBOL]?: EditorWatchdog;
};

/**
 * `EditorWatchdog#create` method does not return editor instance (returns `undefined` instead).
 * This function wraps editor constructor with EditorWatchdog and returns fake constructor that
 * returns editor instance assigned to initialized watchdog.
 *
 * It stores watchdog instance in hidden symbol assigned to editor. It simplifies storing both
 * instances in component's state (it's no longer required to store them separately).
 *
 * @param Editor - The Editor creator to wrap.
 * @returns The Editor creator wrapped with a watchdog.
 */
export function wrapWithWatchdogIfPresent<TEditor extends Editor>(
	Editor: EditorWithWatchdogRelaxedConstructor<TEditor>
): EditorRelaxedConstructor<EditorWithAttachedWatchdog<TEditor>> {
	const { EditorWatchdog } = Editor;

	if ( !EditorWatchdog ) {
		return Editor;
	}

	const watchdog = new EditorWatchdog( Editor );

	watchdog.setCreator( async ( ...args: Parameters<typeof Editor['create']> ) => {
		const editor = await Editor.create( ...args );

		( editor as EditorWithAttachedWatchdog )[ EDITOR_WATCHDOG_SYMBOL ] = watchdog;

		return editor;
	} );

	return {
		...Editor,
		create: async ( ...args: Parameters<typeof watchdog.create> ) => {
			await watchdog.create( ...args );

			return watchdog.editor!;
		}
	};
}

/**
 * Unwraps the EditorWatchdog from the editor instance.
 */
export function unwrapEditorWatchdog( editor: EditorWithAttachedWatchdog ): EditorWatchdog | null {
	if ( EDITOR_WATCHDOG_SYMBOL in editor ) {
		return ( editor as EditorWithAttachedWatchdog )[ EDITOR_WATCHDOG_SYMBOL ] as EditorWatchdog;
	}

	return null;
}
