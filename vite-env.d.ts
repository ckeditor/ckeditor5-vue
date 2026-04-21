/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/// <reference types="vite/client" />

declare const __VUE_INTEGRATION_VERSION__: string;

interface ImportMetaEnv {
	readonly CKEDITOR_LICENSE_KEY: string;
	readonly CKEDITOR_TOKEN_URL: string;
	readonly CKEDITOR_WEBSOCKET_URL: string;
	readonly CKEDITOR_UPLOAD_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	CKEDITOR_GLOBAL_LICENSE_KEY?: string;
}
