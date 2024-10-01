/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { version } from 'vue';

import { createIntegrationUsageDataPlugin } from '@ckeditor/ckeditor5-integrations-common';

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
