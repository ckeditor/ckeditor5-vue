/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditor from '../../src/plugin';
import MockEditor from '../_utils/mockeditor';

Vue.use( CKEditor, {
	editors: {
		classic: MockEditor
	},
	componentName: 'myEditor'
} );

describe( 'CKEditor plugin', () => {
	it( 'allows different component names', done => {
		const wrapper = mount( {
			template: '<myEditor editor="classic"></myEditor>'
		} );

		Vue.nextTick( () => {
			expect( wrapper.vm.$children[ 0 ].instance ).to.be.instanceOf( MockEditor );

			done();
		} );
	} );
} );
