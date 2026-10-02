/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { watch, toValue, onActivated, onDeactivated, type MaybeRefOrGetter } from 'vue';

/**
 * Keeps the `ClassicEditor` UI next to its source element when `<KeepAlive>` deactivates or activates
 * the component. Vue moves only the source element, so the UI inserted after it would be left behind.
 */
export function useEditorKeepAlive(
	editor: MaybeRefOrGetter<EditorWithUIElement | undefined>,
	sourceElement: MaybeRefOrGetter<HTMLElement | undefined>
): void {
	let siblingUIElement: HTMLElement | null = null;

	watch( () => toValue( editor ), currentEditor => {
		const uiElement = currentEditor?.ui.element ?? null;
		const element = toValue( sourceElement );

		siblingUIElement = uiElement && element && uiElement.previousSibling === element ? uiElement : null;
	}, { flush: 'sync' } );

	const putUIBackAfterSourceElement = () => {
		const element = toValue( sourceElement );

		if ( siblingUIElement && element ) {
			element.after( siblingUIElement );
		}
	};

	onDeactivated( putUIBackAfterSourceElement );
	onActivated( putUIBackAfterSourceElement );
}

type EditorWithUIElement = {
	ui: {
		element: HTMLElement | null;
	};
};
