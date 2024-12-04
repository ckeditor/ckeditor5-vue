/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createApp } from 'vue';
import { CkeditorPlugin } from '../../src/plugin.js';
import App from './App.vue';

createApp( App )
	.use( CkeditorPlugin )
	.mount( '#app' );
