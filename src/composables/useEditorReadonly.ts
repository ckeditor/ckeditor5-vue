/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { watch, type Ref } from 'vue';
import type { Editor } from 'ckeditor5';

const INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from Vue integration (@ckeditor/ckeditor5-vue)';

/**
 * Hook that toggles readonly state on provided instance.
 */
export function useEditorReadonly(
	instance: Ref<Editor | undefined>,
	disabled: Ref<boolean | undefined>
): void {
	watch( [ instance, disabled ], ( [ instance, readOnlyMode ] ) => {
		if ( readOnlyMode ) {
			instance?.enableReadOnlyMode( INTEGRATION_READ_ONLY_LOCK_ID );
		} else {
			instance?.disableReadOnlyMode( INTEGRATION_READ_ONLY_LOCK_ID );
		}
	} );
}
