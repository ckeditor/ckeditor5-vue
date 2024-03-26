/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
import {
	MockEditor,
	ModelDocument,
	ViewDocument
} from './_utils/mockeditor';

describe( 'CKEditor Component', () => {
	let sandbox, CKEDITOR_VERSION;

	beforeEach( () => {
		CKEDITOR_VERSION = window.CKEDITOR_VERSION;

		window.CKEDITOR_VERSION = '37.0.0';
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		window.CKEDITOR_VERSION = CKEDITOR_VERSION;
		sandbox.restore();
	} );

	it( 'should have a name', () => {
		expect( CKEditorComponent.name ).to.equal( 'Ckeditor' );
	} );

	it( 'should print a warning if the "window.CKEDITOR_VERSION" variable is not available', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		delete window.CKEDITOR_VERSION;

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await nextTick();
		wrapper.unmount();

		// TODO: fix in https://github.com/ckeditor/ckeditor5-vue/issues/274
		expect( warnStub.callCount ).to.equal( 2 );
		expect( warnStub.secondCall.args[ 0 ] ).to.equal( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
	} );

	it( 'should print a warning if using CKEditor 5 in version lower than 37', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		window.CKEDITOR_VERSION = '30.0.0';

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await nextTick();
		wrapper.unmount();

		expect( warnStub.callCount ).to.equal( 1 );
		expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'The <CKEditor> component requires using CKEditor 5 in version 37 or higher.' );
	} );

	it( 'should not print any warninig if using CKEditor 5 in version 37 or higher', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		window.CKEDITOR_VERSION = '37.0.0';

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await nextTick();
		wrapper.unmount();

		expect( warnStub.callCount ).to.equal( 0 );
	} );

	it( 'should call editor#create when initializing', async () => {
		const stub = sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await nextTick();

		sinon.assert.calledOnce( stub );
		wrapper.unmount();
	} );

	it( 'should call editor#destroy when destroying', async () => {
		const stub = sandbox.stub( MockEditor.prototype, 'destroy' ).resolves();
		const { wrapper, vm } = mountComponent();

		await nextTick();

		wrapper.unmount();
		sinon.assert.calledOnce( stub );
		expect( vm.instance ).to.be.null;
	} );

	it( 'should pass the editor promise rejection error to console#error()', async () => {
		const error = new Error( 'Something went wrong.' );
		const consoleErrorStub = sandbox.stub( console, 'error' );

		sandbox.stub( MockEditor, 'create' ).rejects( error );

		const { wrapper } = mountComponent();

		await timeout( 0 );

		consoleErrorStub.restore();

		expect( consoleErrorStub.calledOnce ).to.be.true;
		expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );

		wrapper.unmount();
	} );

	describe( 'properties', () => {
		describe( '#editor', () => {
			it( 'should accept an editor constructor', async () => {
				const { wrapper, vm } = mountComponent( {
					editor: MockEditor
				} );

				await nextTick();

				expect( vm.editor ).to.equal( MockEditor );
				expect( vm.instance ).to.be.instanceOf( MockEditor );

				wrapper.unmount();
			} );
		} );

		describe( '#modelValue', () => {
			it( 'should be defined', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.modelValue ).to.equal( '' );

				wrapper.unmount();
			} );

			// See: https://github.com/ckeditor/ckeditor5-vue/issues/47.
			it( 'should set the initial data', async () => {
				const { wrapper, vm } = mountComponent( {
					modelValue: 'foo'
				} );

				await nextTick();

				expect( vm.instance.config.initialData ).to.equal( 'foo' );
				expect( vm.instance.setDataCounter ).to.equal( 0 );

				wrapper.unmount();
			} );

			it( 'should sync the editor data after editor is ready', async () => {
				const { wrapper, vm } = mountComponent( {
					modelValue: 'foo'
				} );

				wrapper.setProps( { modelValue: 'bar' } );

				await nextTick();

				expect( vm.instance.data.get() ).to.equal( 'bar' );
				expect( vm.instance.setDataCounter ).to.equal( 1 );

				wrapper.unmount();
			} );
		} );

		describe( '#tagName', () => {
			it( 'should be defined', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.tagName ).to.equal( 'div' );

				wrapper.unmount();
			} );

			it( 'should define the tag of the element', () => {
				const { wrapper, vm } = mountComponent( {
					tagName: 'textarea'
				} );

				expect( vm.$el.tagName ).to.equal( 'TEXTAREA' );

				wrapper.unmount();
			} );
		} );

		describe( '_readOnlyLocks', () => {
			it( 'should be an instance of set', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.instance._readOnlyLocks ).to.be.instanceOf( Set );

				wrapper.unmount();
			} );

			it( 'should be empty when editor is not set to read only mode', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.instance._readOnlyLocks.size ).to.equal( 0 );

				wrapper.unmount();
			} );

			it( 'should contain one lock when editor is set to read only mode', async () => {
				const { wrapper, vm } = mountComponent( {
					disabled: true
				} );

				await nextTick();

				expect( vm.instance._readOnlyLocks.size ).to.equal( 1 );

				wrapper.unmount();
			} );
		} );

		describe( '#config', () => {
			it( 'should be empty', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.config ).to.deep.equal( {} );

				wrapper.unmount();
			} );

			it( 'should be set according to the initial editor#config', async () => {
				const { wrapper, vm } = mountComponent( {
					config: { foo: 'bar' }
				} );

				await nextTick();

				expect( vm.instance.config ).to.deep.equal( { foo: 'bar' } );
				wrapper.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/101
			it( 'should not be mutated', async () => {
				const createStub = sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );

				const ParentComponent = {
					components: {
						ckeditor: CKEditorComponent
					},
					data() {
						return {
							editor: MockEditor,
							editorConfig: {
								foo: 'bar'
							},
							editorFooData: 'foo',
							editorBarData: 'bar',
							editorBazData: 'baz'
						};
					},
					template: `
						<div>
							<ckeditor :editor="editor" tag-name="textarea" v-model="editorFooData" :config="editorConfig">foo</ckeditor>
							<ckeditor :editor="editor" tag-name="textarea" v-model="editorBarData" :config="editorConfig">bar</ckeditor>
							<ckeditor :editor="editor" tag-name="textarea" v-model="editorBazData" :config="editorConfig">baz</ckeditor>
						</div>
					`
				};

				const wrapper = mount( ParentComponent );

				await nextTick();

				const fooEditorConfig = createStub.firstCall.args[ 1 ];
				const barEditorConfig = createStub.secondCall.args[ 1 ];
				const bazEditorConfig = createStub.thirdCall.args[ 1 ];

				expect( fooEditorConfig ).to.not.equal( barEditorConfig );
				expect( fooEditorConfig ).to.not.equal( bazEditorConfig );
				expect( barEditorConfig ).to.not.equal( bazEditorConfig );

				expect( wrapper.vm.editorConfig.initialData ).to.be.undefined;

				wrapper.unmount();
			} );
		} );

		describe( '#disableTwoWayDataBinding', () => {
			it( 'should set disableTwoWayDataBinding to false by default', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.disableTwoWayDataBinding ).to.equal( false );

				wrapper.unmount();
			} );

			it( 'should not update #modelValue when disableTwoWayDataBinding is true', async () => {
				const { wrapper, vm } = mountComponent( { disableTwoWayDataBinding: true } );

				sandbox.stub( ModelDocument.prototype, 'on' );

				await nextTick();

				sandbox.stub( vm.instance.data, 'get' ).returns( 'foo' );

				const on = vm.instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				await timeout( 350 );

				expect( wrapper.emitted().input ).to.be.undefined;

				wrapper.unmount();
			} );
		} );

		it( '#instance should be defined', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			expect( vm.instance ).to.be.instanceOf( MockEditor );

			wrapper.unmount();
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control read only mode of the editor', async () => {
			const { wrapper, vm } = mountComponent( {
				disabled: true
			} );

			await nextTick();

			expect( vm.instance._readOnlyLocks.size ).to.equal( 1 );

			wrapper.setProps( { disabled: false } );

			await nextTick();

			expect( vm.instance._readOnlyLocks.size ).to.equal( 0 );

			wrapper.setProps( { disabled: true } );

			await nextTick();

			expect( vm.instance._readOnlyLocks.size ).to.equal( 1 );

			wrapper.unmount();
		} );

		it( '#modelValue should trigger editor#data.set', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			const spy = sandbox.spy( vm.instance.data, 'set' );
			wrapper.setProps( { modelValue: 'foo' } );

			await nextTick();

			wrapper.setProps( { modelValue: 'bar' } );

			await nextTick();

			sinon.assert.calledTwice( spy );

			// Simulate typing: The #modelValue changes but at the same time, the instance update
			// its own data so instance.data.get() and #modelValue are immediately the same.
			// Make sure instance.data.set() is not called in this situation because it would destroy
			// the selection.
			wrapper.vm.lastEditorData = 'barq';
			wrapper.setProps( { modelValue: 'barq' } );

			await nextTick();

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWithExactly( spy.firstCall, 'foo' );
			sinon.assert.calledWithExactly( spy.secondCall, 'bar' );

			wrapper.unmount();
		} );

		it( '#modelValue should trigger editor#data.set only if data is changed', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			const spy = sandbox.spy( vm.instance.data, 'set' );

			wrapper.setProps( { modelValue: 'foo' } );

			await nextTick();

			wrapper.setProps( { modelValue: 'foo' } );

			await nextTick();

			wrapper.setProps( { modelValue: 'foo' } );

			await nextTick();

			sinon.assert.calledOnce( spy );

			wrapper.unmount();
		} );
	} );

	describe( 'events', () => {
		it( 'should emit #ready when the editor is created', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			expect( wrapper.emitted().ready.length ).to.equal( 1 );
			expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.instance ] );

			wrapper.unmount();
		} );

		it( 'should emit #destroy when the editor is destroyed', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			wrapper.unmount();

			expect( wrapper.emitted().destroy.length ).to.equal( 1 );
			expect( wrapper.emitted().destroy[ 0 ] ).to.deep.equal( [ vm.instance ] );
		} );

		describe( '#input event', () => {
			it( 'should be emitted but debounced when editor data changes', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );

				await nextTick();

				sandbox.stub( vm.instance.data, 'get' ).returns( 'foo' );

				const on = vm.instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				await timeout( 350 );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.instance
				] );

				wrapper.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/149
			it( 'should be emitted immediatelly despite being debounced', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );

				await nextTick();

				sandbox.stub( vm.instance.data, 'get' ).returns( 'foo' );

				const on = vm.instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.instance
				] );

				wrapper.unmount();
			} );
		} );

		it( 'should emit #focus when the editor editable is focused', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await nextTick();

			const on = vm.instance.editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.firstCall.args[ 0 ] ).to.equal( 'focus' );
			expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().focus ).to.be.undefined;

			on.firstCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().focus.length ).to.equal( 1 );
			expect( wrapper.emitted().focus[ 0 ] ).to.deep.equal( [
				evtStub, vm.instance
			] );

			wrapper.unmount();
		} );

		it( 'should emits #blur when the editor editable is blurred', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await nextTick();

			const on = vm.instance.editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.secondCall.args[ 0 ] ).to.equal( 'blur' );
			expect( on.secondCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().blur ).to.be.undefined;

			on.secondCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().blur.length ).to.equal( 1 );
			expect( wrapper.emitted().blur[ 0 ] ).to.deep.equal( [
				evtStub, vm.instance
			] );

			wrapper.unmount();
		} );
	} );

	function mountComponent( props ) {
		const wrapper = mount( CKEditorComponent, {
			props: {
				editor: MockEditor,
				...props
			}
		} );

		return { wrapper, vm: wrapper.vm };
	}

	function timeout( delay ) {
		return new Promise( resolve => setTimeout( resolve, delay ) );
	}
} );
