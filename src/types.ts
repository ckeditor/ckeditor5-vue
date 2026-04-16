/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConstructor } from '@ckeditor/ckeditor5-integrations-common';
import type { Editor, EditorConfig, EditorWatchdog, WatchdogConfig } from 'ckeditor5';

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
	tagName?: string;
	disabled?: boolean;
	disableTwoWayDataBinding?: boolean;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
}

/**
 * Editor constructor with static watchdog class definition.
 */
export type EditorWithWatchdogRelaxedConstructor<TEditor extends Editor> = EditorRelaxedConstructor<TEditor> & {
	EditorWatchdog?: typeof EditorWatchdog;
};

/**
 * Error thrown during initialization or runtime of the editor.
 */
export type EditorErrorDescription<TEditor extends Editor> = {
	error: any;
} & (
	| {
		phase: 'initialization';
	}
	| {
		phase: 'runtime';
		causesRestart: boolean;
		watchdog: EditorWatchdog;
		editor: TEditor;
	}
);
