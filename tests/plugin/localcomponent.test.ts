/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Ckeditor } from '../../src/plugin.js';
import { MockEditor } from '../_utils/mockeditor';

class FooEditor extends MockEditor {}

describe( 'CKEditor plugin', () => {
	it( 'should work when the component is used locally', async () => {
		window.CKEDITOR_VERSION = '42.0.0';

		const firstComponent = mount( Ckeditor, {
			props: {
				editor: FooEditor
			}
		} );

		await nextTick();

		expect( firstComponent.vm.editor ).toBe( FooEditor );

		firstComponent.unmount();
	} );
} );
