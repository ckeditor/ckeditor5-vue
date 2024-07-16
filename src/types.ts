/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { EditorConfig } from 'ckeditor5';

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
export interface Props<TEditor> {
	editor: TEditor;
	config?: EditorConfig;
	tagName?: string;
	disabled?: boolean;
	disableTwoWayDataBinding?: boolean;
}

/**
 * The editor type extracted from the editor instance type.
 */
export type ExtractEditorType<TEditor> = TEditor extends { create( ...args: Array<any> ): Promise<infer E> }
	? E
	: never;
