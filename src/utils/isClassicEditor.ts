/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConstructor } from '@ckeditor/ckeditor5-integrations-common';

export function isClassicEditor( Editor: EditorRelaxedConstructor ): boolean {
	return !Editor.editorName || Editor.editorName === 'ClassicEditor';
}
