/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EditorElement from '../src/EditorElement.vue';
import type { EditorElementObjectDefinition } from '../src/utils/normalizeEditorElementDefinition.js';

describe( 'EditorElement component', () => {
	describe( 'default behaviour', () => {
		it( 'should render a <div> when no definition is provided', () => {
			const wrapper = mount( EditorElement );

			expect( wrapper.element.tagName ).to.equal( 'DIV' );

			wrapper.unmount();
		} );

		it( 'should render a <div> when definition is explicitly null', () => {
			const wrapper = mount( EditorElement, {
				props: { definition: null }
			} );

			expect( wrapper.element.tagName ).to.equal( 'DIV' );

			wrapper.unmount();
		} );
	} );

	describe( 'string definition', () => {
		it( 'should render the correct tag when a string is passed', () => {
			const wrapper = mount( EditorElement, {
				props: { definition: 'textarea' }
			} );

			expect( wrapper.element.tagName ).to.equal( 'TEXTAREA' );

			wrapper.unmount();
		} );

		it( 'should update the rendered tag when definition changes', async () => {
			const wrapper = mount( EditorElement, {
				props: { definition: 'div' }
			} );

			expect( wrapper.element.tagName ).to.equal( 'DIV' );

			await wrapper.setProps( { definition: 'section' } );

			expect( wrapper.element.tagName ).to.equal( 'SECTION' );

			wrapper.unmount();
		} );
	} );

	describe( 'object definition', () => {
		describe( '#name', () => {
			it( 'should render the tag specified in the `name` field', () => {
				const definition: EditorElementObjectDefinition = { name: 'article' };
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.element.tagName ).to.equal( 'ARTICLE' );

				wrapper.unmount();
			} );
		} );

		describe( '#classes', () => {
			it( 'should apply a single class string', () => {
				const definition: EditorElementObjectDefinition = {
					name: 'div',
					classes: 'ck-editor'
				};
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.classes() ).to.include( 'ck-editor' );

				wrapper.unmount();
			} );

			it( 'should apply an array of classes', () => {
				const definition: EditorElementObjectDefinition = {
					name: 'div',
					classes: [ 'ck-editor', 'ck-editor--theme-dark' ]
				};
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.classes() ).to.include.members( [ 'ck-editor', 'ck-editor--theme-dark' ] );

				wrapper.unmount();
			} );

			it( 'should render no extra classes when `classes` is not provided', () => {
				const definition: EditorElementObjectDefinition = { name: 'div' };
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.classes() ).to.deep.equal( [] );

				wrapper.unmount();
			} );
		} );

		describe( '#styles', () => {
			it( 'should apply inline styles', () => {
				const definition: EditorElementObjectDefinition = {
					name: 'div',
					styles: { color: 'red', minHeight: '200px' }
				};
				const wrapper = mount( EditorElement, { props: { definition } } );
				const el = wrapper.element as HTMLElement;

				expect( el.style.color ).to.equal( 'red' );
				expect( el.style.minHeight ).to.equal( '200px' );

				wrapper.unmount();
			} );

			it( 'should apply no inline styles when `styles` is not provided', () => {
				const definition: EditorElementObjectDefinition = { name: 'div' };
				const wrapper = mount( EditorElement, { props: { definition } } );
				const el = wrapper.element as HTMLElement;

				expect( el.style.cssText ).to.equal( '' );

				wrapper.unmount();
			} );
		} );

		describe( '#attributes', () => {
			it( 'should apply extra DOM attributes', () => {
				const definition: EditorElementObjectDefinition = {
					name: 'div',
					attributes: { 'data-testid': 'editor', role: 'textbox' }
				};
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.attributes( 'data-testid' ) ).to.equal( 'editor' );
				expect( wrapper.attributes( 'role' ) ).to.equal( 'textbox' );

				wrapper.unmount();
			} );

			it( 'should apply no extra attributes when `attributes` is not provided', () => {
				const definition: EditorElementObjectDefinition = { name: 'div' };
				const wrapper = mount( EditorElement, { props: { definition } } );

				expect( wrapper.attributes( 'data-testid' ) ).to.be.undefined;

				wrapper.unmount();
			} );
		} );

		it( 'should apply all fields together: name, classes, styles and attributes', () => {
			const definition: EditorElementObjectDefinition = {
				name: 'section',
				classes: [ 'ck-editor', 'custom-theme' ],
				styles: { minHeight: '300px' },
				attributes: { 'aria-label': 'Rich text editor' }
			};
			const wrapper = mount( EditorElement, { props: { definition } } );
			const el = wrapper.element as HTMLElement;

			expect( el.tagName ).to.equal( 'SECTION' );
			expect( wrapper.classes() ).to.include.members( [ 'ck-editor', 'custom-theme' ] );
			expect( el.style.minHeight ).to.equal( '300px' );
			expect( wrapper.attributes( 'aria-label' ) ).to.equal( 'Rich text editor' );

			wrapper.unmount();
		} );
	} );

	describe( '#elementRef', () => {
		it( 'should expose elementRef pointing to the root DOM element', () => {
			const wrapper = mount( EditorElement );

			expect( wrapper.vm.elementRef ).to.equal( wrapper.element );

			wrapper.unmount();
		} );

		it( 'should expose elementRef after definition changes', async () => {
			const wrapper = mount( EditorElement, {
				props: { definition: 'div' }
			} );

			await wrapper.setProps( { definition: 'section' } );

			expect( wrapper.vm.elementRef ).to.equal( wrapper.element );
			expect( ( wrapper.vm.elementRef as HTMLElement ).tagName ).to.equal( 'SECTION' );

			wrapper.unmount();
		} );

		it( 'should have elementRef available after mounting', () => {
			const wrapper = mount( EditorElement );

			expect( wrapper.vm.elementRef ).to.be.instanceOf( HTMLElement );

			wrapper.unmount();
		} );
	} );
} );
