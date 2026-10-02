/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	watch, toValue, onActivated, onDeactivated, onUnmounted,
	type MaybeRefOrGetter, type WatchSource
} from 'vue';

/**
 * Makes Vue handle the UI that `ClassicEditor` inserts right after the source element.
 *
 * Vue did not render that node, so it knows nothing about it. It would make Vue fail when the component is
 * replaced (e.g. on a `:key` change), because the editor removes the node that Vue uses as the insertion
 * anchor, and it would leave the node behind when `<KeepAlive>` moves the component.
 */
export function useEditorSiblingUI(
	editor: WatchSource<EditorWithUIElement | undefined>,
	sourceElement: MaybeRefOrGetter<HTMLElement | undefined>
): void {
	let uiElement: HTMLElement | null = null;
	let anchor: Text | null = null;

	// Other editors make the source element itself the UI, or render it elsewhere, so only the case of the UI
	// placed right after the source element matters. `sync`, so it is checked while the DOM is exactly as the
	// editor left it.
	watch( editor, currentEditor => {
		const element = toValue( sourceElement );
		const ui = currentEditor?.ui?.element;

		if ( ui && element && ui.previousSibling === element ) {
			uiElement = ui;

			// An empty node of our own between the two, so that Vue's insertion anchor (the node after the
			// source element) survives destroying the editor.
			anchor = document.createTextNode( '' );
			element.after( anchor );
		}
	}, { flush: 'sync' } );

	// Both hooks run after Vue has moved the source element, and leave the UI behind.
	const putUIBackAfterSourceElement = () => {
		if ( anchor && uiElement ) {
			toValue( sourceElement )!.after( anchor, uiElement );
		}
	};

	onDeactivated( putUIBackAfterSourceElement );
	onActivated( putUIBackAfterSourceElement );

	// Runs after Vue has inserted the new element before the anchor.
	onUnmounted( () => anchor?.remove() );
}

type EditorWithUIElement = {
	ui?: {
		element?: HTMLElement | null;
	};
};
