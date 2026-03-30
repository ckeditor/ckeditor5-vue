/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getInstalledCKBaseFeatures } from '@ckeditor/ckeditor5-integrations-common';

import type { EditorRelaxedConfig } from '../types.js';

/**
 * Retrieves the initial data from the editor configuration object, depending on the loaded CKEditor version.
 */
export function getInitialDataFromEditorConfig( config: EditorRelaxedConfig ): string | undefined {
	const supports = getInstalledCKBaseFeatures();

	if ( supports.rootsConfigEntry ) {
		return config.roots?.main?.initialData || config.root?.initialData || /* legacy */ config.initialData;
	}

	return config.initialData;
}
