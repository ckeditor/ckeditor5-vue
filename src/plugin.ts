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

/**
 * The component is exported as `Ckeditor` and not `CKEditor`, because of how Vue handles components with
 * capitalized names. The component with more than one consecutive capital letter will also be be available
 * in kebab-case, where each capital letter is separated by `-`. This way, the `CKEditor` component will
 * be available as `c-k-editor`, which doesn't look good.
 */
export {
	CkeditorPlugin,
	Ckeditor
};

declare module 'vue' {
	interface GlobalComponents {
		Ckeditor: typeof Ckeditor;
		ckeditor: typeof Ckeditor;
	}
}
