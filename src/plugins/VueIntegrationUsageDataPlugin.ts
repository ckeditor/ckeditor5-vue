/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { version } from 'vue';
import {
	createIntegrationUsageDataPlugin,
	appendExtraPluginsToEditorConfig,
	isCKEditorFreeLicense
} from '@ckeditor/ckeditor5-integrations-common';

import type { EditorConfig } from 'ckeditor5';

/**
 * This part of the code is not executed in open-source implementations using a GPL key.
 * It only runs when a specific license key is provided. If you are uncertain whether
 * this applies to your installation, please contact our support team.
 */
export const VueIntegrationUsageDataPlugin = createIntegrationUsageDataPlugin(
	'vue',
	{
		version: __VUE_INTEGRATION_VERSION__,
		frameworkVersion: version
	}
);

/**
 * Appends all integration plugins to the editor configuration.
 *
 * @param editorConfig The editor configuration.
 * @returns The editor configuration with all integration plugins appended.
 */
export function appendUsageDataPluginToConfig( editorConfig: EditorConfig ): EditorConfig {
	/**
	 * Do not modify the editor configuration if the editor is using a free license.
	 */
	if ( isCKEditorFreeLicense( editorConfig.licenseKey ) ) {
		return editorConfig;
	}

	return appendExtraPluginsToEditorConfig( editorConfig, [
		/**
		 * This part of the code is not executed in open-source implementations using a GPL key.
		 * It only runs when a specific license key is provided. If you are uncertain whether
		 * this applies to your installation, please contact our support team.
		 */
		VueIntegrationUsageDataPlugin
	] );
}
