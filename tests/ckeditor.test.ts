/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { nextTick } from 'vue';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Ckeditor } from '../src/plugin.ts';
import {
	MockEditor,
	ModelDocument,
	ViewDocument
} from './_utils/mockeditor';

describe( 'CKEditor component', () => {
	beforeEach( () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '42.0.0' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	} );

	it( 'should have a name', () => {
		expect( Ckeditor.name ).to.equal( 'CKEditor' );
	} );

	it( 'should print a warning if the "window.CKEDITOR_VERSION" variable is not available', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', undefined );

		const consoleWarn = vi.spyOn( console, 'warn' ).mockReturnValue();
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( consoleWarn ).toHaveBeenCalledOnce();
		expect( consoleWarn ).toHaveBeenNthCalledWith( 1,
			'Cannot find the "CKEDITOR_VERSION" in the "window" scope.'
		);
	} );

	it( 'should print a warning if using CKEditor 5 in version lower than 42', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '30.0.0' );

		const consoleWarn = vi.spyOn( console, 'warn' ).mockReturnValue();
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( consoleWarn ).toHaveBeenCalledOnce();
		expect( consoleWarn ).toHaveBeenNthCalledWith( 1,
			'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.'
		);
	} );

	it( 'should not print any warning if using CKEditor 5 in version 42 or higher', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '42.0.0' );

		const consoleWarn = vi.spyOn( console, 'warn' );
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( consoleWarn ).not.toHaveBeenCalledOnce();
	} );

	it( 'should not print any warning if using nightly build of CKEditor 5', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '0.0.0-nightly' );

		const consoleWarn = vi.spyOn( console, 'warn' );
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( consoleWarn ).not.toHaveBeenCalledOnce();
	} );

	it( 'should call editor#create when initializing', async () => {
		const stub = vi.spyOn( MockEditor, 'create' );
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( stub ).toHaveBeenCalledOnce();
	} );

	it( 'should call editor#destroy when destroying', async () => {
		const stub = vi.spyOn( MockEditor.prototype, 'destroy' );
		const component = mountComponent();

		await nextTick();
		component.unmount();

		expect( stub ).toHaveBeenCalledOnce();
		expect( component.vm.instance ).to.be.undefined;
	} );

	it( 'should pass the editor promise rejection error to console#error()', async () => {
		const error = new Error( 'Something went wrong.' );
		vi.spyOn( MockEditor, 'create' ).mockRejectedValue( error );

		const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();
		const component = mountComponent();

		await timeout( 0 );

		expect( consoleError ).toHaveBeenCalled();
		expect( consoleError ).toHaveBeenNthCalledWith( 1, error );

		component.unmount();
	} );

	describe( 'properties', () => {
		describe( '#editor', () => {
			it( 'should accept an editor constructor', async () => {
				const component = mountComponent( {
					editor: MockEditor
				} );

				await nextTick();

				expect( component.vm.editor ).to.equal( MockEditor );
				expect( component.vm.instance ).to.be.instanceOf( MockEditor );

				component.unmount();
			} );
		} );

		describe( '#modelValue', () => {
			it( 'should be defined', async () => {
				const component = mountComponent();

				await nextTick();

				expect( component.vm.modelValue ).to.equal( '' );

				component.unmount();
			} );

			// See: https://github.com/ckeditor/ckeditor5-vue/issues/47.
			it( 'should set the initial data', async () => {
				const editor = vi.spyOn( MockEditor, 'create' );

				const component = mountComponent( {
					modelValue: 'foo'
				} );

				await nextTick();

				expect( editor ).toHaveBeenCalledOnce();
				expect( editor ).toHaveBeenCalledWith( expect.any( HTMLElement ), { initialData: 'foo' } );

				component.unmount();
			} );

			it( 'should sync the editor data after editor is ready', async () => {
				const component = mountComponent( {
					modelValue: 'foo'
				} );

				component.setProps( { modelValue: 'bar' } );

				await nextTick();

				expect( component.vm.instance!.data.get() ).to.equal( 'bar' );

				component.unmount();
			} );
		} );

		describe( '#tagName', () => {
			it( 'should be defined', async () => {
				const component = mountComponent();

				await nextTick();

				expect( component.vm.tagName ).to.equal( 'div' );

				component.unmount();
			} );

			it( 'should define the tag of the element', () => {
				const component = mountComponent( {
					tagName: 'textarea'
				} );

				expect( component.vm.$el.tagName ).to.equal( 'TEXTAREA' );

				component.unmount();
			} );
		} );

		describe( 'isReadOnly', () => {
			it( 'should be empty when editor is not set to read only mode', async () => {
				const component = mountComponent();

				await nextTick();

				expect( component.vm.instance!.isReadOnly ).toBeFalsy();

				component.unmount();
			} );

			it( 'should contain one lock when editor is set to read only mode', async () => {
				const component = mountComponent( {
					disabled: true
				} );

				await nextTick();

				expect( component.vm.instance!.isReadOnly ).toBeTruthy();

				component.unmount();
			} );
		} );

		describe( '#config', () => {
			it( 'should be empty', async () => {
				const component = mountComponent();

				await nextTick();

				expect( component.vm.config ).to.deep.equal( {} );

				component.unmount();
			} );

			it( 'should be set according to the initial editor#config', async () => {
				const component = mountComponent( {
					config: { foo: 'bar' }
				} );

				await nextTick();

				expect( component.vm.instance!.config ).to.deep.equal( { foo: 'bar' } );
				component.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/101
			it( 'should not be mutated', async () => {
				const stub = vi.spyOn( MockEditor, 'create' );

				const component = mount( {
					components: {
						Ckeditor
					},
					data: () => ( {
						editor: MockEditor,
						editorConfig: {
							foo: 'bar'
						},
						first: 'foo',
						second: 'bar',
						third: 'baz'
					} ),
					template: `
					<div>
						<ckeditor ref="first" :editor="editor" tag-name="textarea" v-model="first" :config="editorConfig">foo</ckeditor>
						<ckeditor ref="second" :editor="editor" tag-name="textarea" v-model="second" :config="editorConfig">bar</ckeditor>
						<ckeditor ref="third" :editor="editor" tag-name="textarea" v-model="third" :config="editorConfig">baz</ckeditor>
					</div>
				`
				} );

				await nextTick();

				expect( stub ).toHaveBeenCalledTimes( 3 );
				expect( stub ).toHaveBeenNthCalledWith( 1, expect.any( HTMLElement ), { foo: 'bar', initialData: 'foo' } );
				expect( stub ).toHaveBeenNthCalledWith( 2, expect.any( HTMLElement ), { foo: 'bar', initialData: 'bar' } );
				expect( stub ).toHaveBeenNthCalledWith( 3, expect.any( HTMLElement ), { foo: 'bar', initialData: 'baz' } );

				component.unmount();
			} );
		} );

		describe( '#disableTwoWayDataBinding', () => {
			it( 'should set disableTwoWayDataBinding to false by default', async () => {
				const component = mountComponent();

				await nextTick();

				expect( component.vm.disableTwoWayDataBinding ).to.equal( false );

				component.unmount();
			} );

			it( 'should not update #modelValue when disableTwoWayDataBinding is true', async () => {
				const on = vi.spyOn( ModelDocument.prototype, 'on' );
				const component = mountComponent( { disableTwoWayDataBinding: true } );

				await nextTick();

				vi.spyOn( component.vm.instance!.data, 'get' ).mockReturnValue( 'foo' );

				expect( on ).toHaveBeenCalledOnce();
				expect( on ).toHaveBeenNthCalledWith( 1, 'change:data', expect.any( Function ) );
				expect( component.emitted().input ).to.be.undefined;

				on.mock.calls[ 0 ][ 1 ]( {} );

				await timeout( 350 );

				expect( component.emitted().input ).to.be.undefined;

				component.unmount();
			} );
		} );

		it( '#instance should be defined', async () => {
			const component = mountComponent();

			await nextTick();

			expect( component.vm.instance ).to.be.instanceOf( MockEditor );

			component.unmount();
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control read only mode of the editor', async () => {
			const component = mountComponent( {
				disabled: true
			} );

			await nextTick();

			expect( component.vm.instance!.isReadOnly ).toBeTruthy();

			component.setProps( { disabled: false } );

			await nextTick();

			expect( component.vm.instance!.isReadOnly ).toBeFalsy();

			component.setProps( { disabled: true } );

			await nextTick();

			expect( component.vm.instance!.isReadOnly ).toBeTruthy();

			component.unmount();
		} );

		it( '#modelValue should trigger editor#data.set', async () => {
			const component = mountComponent();

			await nextTick();

			const spy = vi.spyOn( component.vm.instance!.data, 'set' );
			component.setProps( { modelValue: 'foo' } );

			await nextTick();

			component.setProps( { modelValue: 'bar' } );

			await nextTick();

			expect( spy ).toHaveBeenCalledTimes( 2 );

			// Simulate typing: The #modelValue changes but at the same time, the instance update
			// its own data so instance.data.get() and #modelValue are immediately the same.
			// Make sure instance.data.set() is not called in this situation because it would destroy
			// the selection.
			component.vm.lastEditorData = 'barq';
			component.setProps( { modelValue: 'barq' } );

			await nextTick();

			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenNthCalledWith( 1, 'foo' );
			expect( spy ).toHaveBeenNthCalledWith( 2, 'bar' );

			component.unmount();
		} );

		it( '#modelValue should trigger editor#data.set only if data is changed', async () => {
			const component = mountComponent();

			await nextTick();

			const spy = vi.spyOn( component.vm.instance!.data, 'set' );

			component.setProps( { modelValue: 'foo' } );

			await nextTick();

			component.setProps( { modelValue: 'foo' } );

			await nextTick();

			component.setProps( { modelValue: 'foo' } );

			await nextTick();

			expect( spy ).toHaveBeenCalledOnce();

			component.unmount();
		} );
	} );

	describe( 'events', () => {
		it( 'should emit #ready when the editor is created', async () => {
			const component = mountComponent();

			await nextTick();

			expect( component.emitted().ready.length ).to.equal( 1 );
			expect( component.emitted().ready[ 0 ] ).to.deep.equal( [ component.vm.instance ] );

			component.unmount();
		} );

		it( 'should emit #destroy when the editor is destroyed', async () => {
			const component = mountComponent();

			await nextTick();

			component.unmount();

			expect( component.emitted().destroy.length ).to.equal( 1 );
		} );

		describe( '#input event', () => {
			it( 'should be emitted but debounced when editor data changes', async () => {
				const on = vi.spyOn( ModelDocument.prototype, 'on' );
				const component = mountComponent();

				await nextTick();

				expect( on ).toHaveBeenCalledOnce();
				expect( on ).toHaveBeenNthCalledWith( 1, 'change:data', expect.any( Function ) );
				expect( component.emitted().input ).to.be.undefined;

				vi.spyOn( component.vm.instance!.data, 'get' ).mockReturnValue( 'foo' );

				on.mock.calls[ 0 ][ 1 ]( {} );

				await timeout( 350 );

				expect( component.emitted().input.length ).to.equal( 1 );
				expect( component.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', {}, component.vm.instance
				] );

				component.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/149
			it( 'should be emitted immediatelly despite being debounced', async () => {
				const on = vi.spyOn( ModelDocument.prototype, 'on' );
				const component = mountComponent();

				await nextTick();

				expect( on ).toHaveBeenCalledOnce();
				expect( on ).toHaveBeenNthCalledWith( 1, 'change:data', expect.any( Function ) );
				expect( component.emitted().input ).to.be.undefined;

				vi.spyOn( component.vm.instance!.data, 'get' ).mockReturnValue( 'foo' );

				on.mock.calls[ 0 ][ 1 ]( {} );

				await timeout( 350 );

				expect( component.emitted().input.length ).to.equal( 1 );
				expect( component.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', {}, component.vm.instance
				] );

				component.unmount();
			} );
		} );

		it( 'should emit #focus when the editor editable is focused', async () => {
			const on = vi.spyOn( ViewDocument.prototype, 'on' );
			const component = mountComponent();

			await nextTick();

			expect( on ).toHaveBeenCalledTimes( 2 );
			expect( on ).toHaveBeenNthCalledWith( 1, 'focus', expect.any( Function ) );
			expect( component.emitted().focus ).to.be.undefined;

			on.mock.calls[ 0 ][ 1 ]( {} );

			expect( component.emitted().focus.length ).to.equal( 1 );
			expect( component.emitted().focus[ 0 ] ).to.deep.equal( [
				{}, component.vm.instance
			] );

			component.unmount();
		} );

		it( 'should emits #blur when the editor editable is blurred', async () => {
			const on = vi.spyOn( ViewDocument.prototype, 'on' );
			const component = mountComponent();

			await nextTick();

			expect( on ).toHaveBeenCalledTimes( 2 );
			expect( on ).toHaveBeenNthCalledWith( 2, 'blur', expect.any( Function ) );
			expect( component.emitted().blur ).to.be.undefined;

			on.mock.calls[ 1 ][ 1 ]( {} );

			expect( component.emitted().blur.length ).to.equal( 1 );
			expect( component.emitted().blur[ 0 ] ).to.deep.equal( [
				{}, component.vm.instance
			] );

			component.unmount();
		} );
	} );
} );

function mountComponent( props: Record<string, any> = {} ) {
	return mount( Ckeditor, {
		props: {
			editor: MockEditor,
			...props
		}
	} );
}

function timeout( delay: number ) {
	return new Promise( resolve => setTimeout( resolve, delay ) );
}
