/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { toValue, watchEffect, type MaybeRefOrGetter } from 'vue';
import type { Editor } from 'ckeditor5';

const INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from Vue integration (@ckeditor/ckeditor5-vue)';

/**
 * Hook that toggles readonly state on provided instance.
 */
export function useEditorReadOnly(
	instance: MaybeRefOrGetter<Editor | undefined>,
	disabled: MaybeRefOrGetter<boolean | undefined>
): void {
	watchEffect( () => {
		const editor = toValue( instance );
		const isDisabled = !!toValue( disabled );

		if ( editor ) {
			toggleEditorReadOnly( editor, isDisabled );
		}
	} );
}

/**
 * Toggles editor to readonly state.
 */
export function toggleEditorReadOnly( editor: Editor, readOnly: boolean ): void {
	if ( readOnly ) {
		editor.enableReadOnlyMode( INTEGRATION_READ_ONLY_LOCK_ID );
	} else {
		editor.disableReadOnlyMode( INTEGRATION_READ_ONLY_LOCK_ID );
	}
}
