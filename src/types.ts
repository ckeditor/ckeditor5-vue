/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, EditorConfig } from 'ckeditor5';

/**
 * This file contains types for the CKEditor 5 Vue component.
 * These types were moved to a separate file, because the `vue-tsc`
 * package couldn't generate the correct types for the component
 * when the types were in the component file. This is a workaround
 * that may be fixed in the next versions of `vue-tsc`.
 */

/**
 * The props accepted by the `<ckeditor>` component.
 */
export interface Props<TEditorConstructor> {
	editor: TEditorConstructor;
	config?: EditorConfig;
	disabled?: boolean;
	disableTwoWayDataBinding?: boolean;

	/**
	 * @deprecated Use `config.root.element` (or `config.roots.main.element`) instead.
	 */
	tagName?: string;
}

/**
 * Error thrown during initialization or runtime of the editor.
 *
 * The two phases differ in what there is to hand over: an editor that failed to start does not exist,
 * while one that failed later does.
 */
export type EditorErrorDescription<TEditor extends Editor> = (
	| {
		phase: 'initialization';
	}
	| {
		phase: 'runtime';
		editor: TEditor;
	}
);
