/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor } from 'ckeditor5';

/**
 * Removes all DOM elements injected by a specific CKEditor instance.
 * Call this before assigning a new instance (e.g. in the 'restart' watchdog handler),
 * because the watchdog does not clean up the previous editor's DOM on its own.
 */
export function cleanupOrphanEditorElements( editor: Editor ): void {
	const uiElement = editor.ui?.element;

	if ( uiElement?.isConnected ) {
		uiElement.remove();
	}

	const bodyCollectionContainer = ( editor.ui as any )?.view?.body?._bodyCollectionContainer;

	if ( bodyCollectionContainer?.isConnected ) {
		bodyCollectionContainer.remove();
	}

	const editingView = editor.editing?.view;

	if ( editingView ) {
		for ( const domRoot of editingView.domRoots.values() ) {
			if ( !( domRoot instanceof HTMLElement ) ) {
				continue;
			}

			domRoot.removeAttribute( 'contenteditable' );
			domRoot.removeAttribute( 'role' );
			domRoot.removeAttribute( 'aria-label' );
			domRoot.removeAttribute( 'aria-multiline' );
			domRoot.removeAttribute( 'spellcheck' );
			domRoot.classList.remove(
				'ck',
				'ck-content',
				'ck-editor__editable',
				'ck-rounded-corners',
				'ck-editor__editable_inline',
				'ck-blurred',
				'ck-focused'
			);
		}
	}
}
