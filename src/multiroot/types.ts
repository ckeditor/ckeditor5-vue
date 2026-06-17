/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	EditorConfig,
	EventInfo,
	MultiRootEditor,
	WatchdogConfig
} from 'ckeditor5';

import type { EditorErrorDescription, EditorWithWatchdogRelaxedConstructor } from '../types.js';
import type { EditorElementDefinition } from '../utils/normalizeEditorElementDefinition.js';

export type MultiRootEditorData = Record<string, string>;

export type MultiRootEditorRootAttributes = Record<string, unknown>;

export type MultiRootEditorRootsAttributes = Record<string, MultiRootEditorRootAttributes>;

export type MultiRootEditorWithWatchdogRelaxedConstructor<TEditor extends MultiRootEditor = MultiRootEditor> =
	EditorWithWatchdogRelaxedConstructor<TEditor>;

export interface MultiRootProps<TEditorConstructor> {
	editor: TEditorConstructor;
	config?: EditorConfig;
	disabled?: boolean;
	disableTwoWayDataBinding?: boolean;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
}

export type RootEditableOptionsAttribute = {

	/**
	 * Placeholder for the editable element. If not set, placeholder value from the editor configuration will be used.
	 */
	placeholder?: string;

	/**
	 * The accessible label text describing the editable to assistive technologies.
	 */
	label?: string;

	/**
	 * A description of the editable root element to create.
	 */
	element?: EditorElementDefinition;
};

export type MultiRootEditorLifecycleEvents<TEditor extends MultiRootEditor> = {
	ready: [ editor: TEditor ];
	destroy: [ editor: TEditor ];
	blur: [ event: EventInfo, editor: TEditor ];
	focus: [ event: EventInfo, editor: TEditor ];
};

export type MultiRootEditorVModelEvents<TEditor extends MultiRootEditor> = {
	input: [ data: MultiRootEditorData, event: EventInfo | null, editor: TEditor ];
	'update:modelValue': [ data: MultiRootEditorData, event: EventInfo | null, editor: TEditor ];
	'update:rootsAttributes': [ rootsAttributes: MultiRootEditorRootsAttributes, event: EventInfo | null, editor: TEditor ];
};

export type MultiRootEditorErrorDescription<TEditor extends MultiRootEditor> = EditorErrorDescription<TEditor>;

export type AddRootOptions = {
	name: string;
	data?: string;
	attributes?: MultiRootEditorRootAttributes;
	isUndoable?: boolean;
	modelElement?: string;
	editableOptions?: RootEditableOptionsAttribute;
	[ key: string ]: unknown;
};
