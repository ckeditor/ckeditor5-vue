/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

declare module '*.vue' {
	import type { DefineComponent } from 'vue';

	const Component: DefineComponent<object, object, any>;

	export default Component;
}
