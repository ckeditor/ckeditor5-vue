/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */
import * as Vue from 'vue';
import Ckeditor from './ckeditor.vue';

/* istanbul ignore if -- @preserve */
if ( !Vue.version || !Vue.version.startsWith( '3.' ) ) {
	throw new Error(
		'The CKEditor plugin works only with Vue 3+. ' +
		'For more information, please refer to ' +
		'https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html'
	);
}

const CkeditorPlugin = {
	/**
	 * Installs the plugin, registering the `<ckeditor>` component.
	 *
	 * @param app The application instance.
	 */
	install( app: Vue.App ): void {
		app.component( 'Ckeditor', Ckeditor );
	}
};

export {
	CkeditorPlugin,
	Ckeditor
};

declare module 'vue' {
	interface GlobalComponents {
		Ckeditor: typeof Ckeditor;
	}
}
