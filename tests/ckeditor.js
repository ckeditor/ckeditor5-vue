/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, console, setTimeout */

import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
import {
	MockEditor,
	ModelDocument,
	ViewDocument,
} from './_utils/mockeditor';
import waitForEditorToBeReady from './_utils/waitforeditortobeready';
import throwError from './_utils/throwerror';

describe( 'CKEditor Component', () => {
	let sandbox, CKEDITOR_VERSION;

	beforeEach( () => {
		CKEDITOR_VERSION = window.CKEDITOR_VERSION;

		window.CKEDITOR_VERSION = '34.0.0';
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		window.CKEDITOR_VERSION = CKEDITOR_VERSION;
		sandbox.restore();
	} );

	it( 'should have a name', () => {
		expect( CKEditorComponent.name ).to.equal( 'ckeditor' );
	} );

	it( 'should print a warning if the "window.CKEDITOR_VERSION" variable is not available', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		delete window.CKEDITOR_VERSION;

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await waitForEditorToBeReady();
		wrapper.unmount();

		expect( warnStub.callCount ).to.equal( 1 );
		expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
	} );

	it( 'should print a warning if using CKEditor 5 in version lower than 34', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		window.CKEDITOR_VERSION = '30.0.0';

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await waitForEditorToBeReady();
		wrapper.unmount();

		expect( warnStub.callCount ).to.equal( 1 );
		expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'The <CKEditor> component requires using CKEditor 5 in version 34 or higher.' );
	} );

	it( 'should not print any warninig if using CKEditor 5 in version 34 or higher', async () => {
		const warnStub = sandbox.stub( console, 'warn' );

		window.CKEDITOR_VERSION = '34.0.0';

		sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await waitForEditorToBeReady();
		wrapper.unmount();

		expect( warnStub.callCount ).to.equal( 0 );
	} );

	it( 'should call editor#create when initializing', async () => {
		const stub = sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = mountComponent();

		await waitForEditorToBeReady();

		sinon.assert.calledOnce( stub );
		wrapper.unmount();
	} );

	it( 'should call watchdog#destroy when destroying', async () => {
		const { wrapper, vm } = mountComponent();
		await waitForEditorToBeReady();

		const stub = sandbox.stub( vm.watchdog, 'destroy' ).callsFake( () => {
			return Promise.resolve();
		} );

		wrapper.unmount();
		sinon.assert.calledOnce( stub );
		expect( vm.watchdog ).to.be.null;
	} );

	it( 'should pass the editor promise rejection error to console#error()', async () => {
		const error = new Error( 'Something went wrong.' );
		const consoleErrorStub = sandbox.stub( console, 'error' );

		sandbox.stub( MockEditor, 'create' ).rejects( error );

		const { wrapper } = mountComponent( {
			editor: MockEditor
		} );

		await waitForEditorToBeReady();

		consoleErrorStub.restore();

		expect( consoleErrorStub.calledOnce ).to.be.true;
		expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );
		expect( consoleErrorStub.called ).to.be.true;
		expect( wrapper.emitted().error.length ).to.equal( 1 );
		expect( wrapper.emitted().error[ 0 ][ 0 ].phase ).to.equal( 'initialization' );
		expect( wrapper.emitted().error[ 0 ][ 0 ].willEditorRestart ).to.equal( false );

		wrapper.unmount();
	} );

	it( 'passes the specified editor class to the watchdog feature', async () => {
		const originalFunction = CKEditorComponent.methods.getWatchdog;
		const EditorWatchdog = originalFunction();
		const constructorSpy = sinon.spy();
		class CustomEditorWatchdog extends EditorWatchdog {
			constructor( ...args ) {
				super( ...args );
				constructorSpy( ...args );
			}
		}

		CKEditorComponent.methods.getWatchdog = () => {
			return CustomEditorWatchdog;
		};

		mountComponent();

		await waitForEditorToBeReady();

		expect( constructorSpy.called ).to.equal( true );
		expect( constructorSpy.firstCall.args[ 0 ] ).to.equal( MockEditor );

		CKEditorComponent.methods.getWatchdog = originalFunction;
	} );

	it( 'getEditor returns null if not initialized', async () => {
		const { vm } = await new Promise( res => {
			const response = mountComponent( {
				editor: MockEditor
			} );

			return res( response );
		} );

		const editor = vm.getEditor();

		expect( editor ).to.equal( null );
	} );

	describe( 'in case of error handling', () => {
		it( 'should restart the editor if a runtime error occurs', async () => {
			const { vm } = await new Promise( res => {
				const response = mountComponent( {
					editor: MockEditor
				} );

				return res( response );
			} );

			await waitForEditorToBeReady();

			const firstEditor = vm.getEditor();

			await throwError( vm );

			const secondEditor = vm.getEditor();

			expect( firstEditor ).to.be.instanceOf( MockEditor );
			expect( secondEditor ).to.be.instanceOf( MockEditor );

			expect( firstEditor ).to.not.equal( secondEditor );
		} );

		it( 'should disable the editor if too many runtime error occurs', async () => {
			const { vm } = await new Promise( res => {
				const response = mountComponent( {
					editor: MockEditor
				} );

				return res( response );
			} );

			await waitForEditorToBeReady();

			await throwError( vm );
			await throwError( vm );
			await throwError( vm );
			await throwError( vm );
			await throwError( vm );

			expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 1 );
		} );
	} );

	describe( 'properties', () => {
		describe( '#editor', () => {
			it( 'should accept an editor constructor', async () => {
				const { wrapper, vm } = mountComponent( {
					editor: MockEditor
				} );

				await waitForEditorToBeReady();

				expect( vm.editor ).to.equal( MockEditor );
				expect( vm.getEditor() ).to.be.instanceOf( MockEditor );

				wrapper.unmount();
			} );
		} );

		describe( '#modelValue', () => {
			it( 'should be defined', async () => {
				const { wrapper, vm } = mountComponent();

				await waitForEditorToBeReady();

				expect( vm.modelValue ).to.equal( '' );

				wrapper.unmount();
			} );

			// See: https://github.com/ckeditor/ckeditor5-vue/issues/47.
			it( 'should set the initial data', async () => {
				const { wrapper, vm } = mountComponent( {
					modelValue: 'foo'
				} );

				await waitForEditorToBeReady();

				expect( vm.getEditor().config.initialData ).to.equal( 'foo' );
				expect( vm.getEditor().setDataCounter ).to.equal( 0 );

				wrapper.unmount();
			} );

			it( 'should sync the editor data after editor is ready', async () => {
				const { wrapper, vm } = mountComponent( {
					modelValue: 'foo'
				} );

				wrapper.setProps( { modelValue: 'bar' } );

				await waitForEditorToBeReady();

				expect( vm.getEditor().getData() ).to.equal( 'bar' );
				expect( vm.getEditor().setDataCounter ).to.equal( 1 );

				wrapper.unmount();
			} );
		} );

		describe( '#tagName', () => {
			it( 'should be defined', async () => {
				const { wrapper, vm } = mountComponent();

				await waitForEditorToBeReady();

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

				await waitForEditorToBeReady();

				expect( vm.getEditor()._readOnlyLocks ).to.be.instanceOf( Set );

				wrapper.unmount();
			} );

			it( 'should be empty when editor is not set to read only mode', async () => {
				const { wrapper, vm } = mountComponent();

				await waitForEditorToBeReady();

				expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 0 );

				wrapper.unmount();
			} );

			it( 'should contain one lock when editor is set to read only mode', async () => {
				const { wrapper, vm } = mountComponent( {
					disabled: true
				} );

				await waitForEditorToBeReady();

				expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 1 );

				wrapper.unmount();
			} );
		} );

		describe( '#config', () => {
			it( 'should be empty', async () => {
				const { wrapper, vm } = mountComponent();

				await waitForEditorToBeReady();

				expect( vm.config ).to.deep.equal( {} );

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

				await waitForEditorToBeReady();

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

		it( '#editor should be defined', async () => {
			const { wrapper, vm } = mountComponent();

			await waitForEditorToBeReady();
			await new Promise( res => setTimeout( res, 1 ) );

			expect( vm.getEditor() ).to.be.instanceOf( MockEditor );

			wrapper.unmount();
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control read only mode of the editor', async () => {
			const { wrapper, vm } = mountComponent( {
				disabled: true
			} );

			await waitForEditorToBeReady();

			expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 1 );

			wrapper.setProps( { disabled: false } );

			await waitForEditorToBeReady();

			expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 0 );

			wrapper.setProps( { disabled: true } );

			await waitForEditorToBeReady();

			expect( vm.getEditor()._readOnlyLocks.size ).to.equal( 1 );

			wrapper.unmount();
		} );

		it( '#modelValue should trigger editor#setData', async () => {
			const { wrapper, vm } = mountComponent();

			await waitForEditorToBeReady();

			const spy = sandbox.spy( vm.getEditor(), 'setData' );
			wrapper.setProps( { modelValue: 'foo' } );

			await waitForEditorToBeReady();

			wrapper.setProps( { modelValue: 'bar' } );

			await waitForEditorToBeReady();

			sinon.assert.calledTwice( spy );

			// Simulate typing: The #modelValue changes but at the same time, the getEditor() update
			// its own data so getEditor().getData() and #modelValue are immediately the same.
			// Make sure getEditor().setData() is not called in this situation because it would destroy
			// the selection.
			wrapper.vm.lastEditorData = 'barq';
			wrapper.setProps( { modelValue: 'barq' } );

			await waitForEditorToBeReady();

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWithExactly( spy.firstCall, 'foo' );
			sinon.assert.calledWithExactly( spy.secondCall, 'bar' );

			wrapper.unmount();
		} );

		it( '#modelValue should trigger editor#setData only if data is changed', async () => {
			const { wrapper, vm } = mountComponent();

			await waitForEditorToBeReady();

			const spy = sandbox.spy( vm.getEditor(), 'setData' );

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

			await waitForEditorToBeReady();

			expect( wrapper.emitted().ready.length ).to.equal( 1 );
			expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.getEditor() ] );

			wrapper.unmount();
		} );

		it( 'should emit #destroy when the editor is destroyed', async () => {
			const { wrapper } = mountComponent();

			await waitForEditorToBeReady();

			wrapper.unmount();

			expect( wrapper.emitted().destroy.length ).to.equal( 1 );
			expect( wrapper.emitted().destroy[ 0 ][ 0 ] ).to.be.instanceOf( MockEditor );
		} );

		describe( '#input event', () => {
			it( 'should be emitted but debounced when editor data changes', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );
				sandbox.stub( MockEditor.prototype, 'getData' ).returns( 'foo' );

				await waitForEditorToBeReady();

				const on = vm.getEditor().model.document.on;
				const evtStub = {};

				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				await timeout( 350 );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.getEditor()
				] );

				wrapper.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/149
			it( 'should be emitted immediately despite being debounced', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );
				sandbox.stub( MockEditor.prototype, 'getData' ).returns( 'foo' );

				await waitForEditorToBeReady();

				const on = vm.getEditor().model.document.on;
				const evtStub = {};

				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.getEditor()
				] );

				wrapper.unmount();
			} );
		} );

		it( 'should emit #focus when the editor editable is focused', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await waitForEditorToBeReady();

			const on = vm.getEditor().editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.firstCall.args[ 0 ] ).to.equal( 'focus' );
			expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().focus ).to.be.undefined;

			on.firstCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().focus.length ).to.equal( 1 );
			expect( wrapper.emitted().focus[ 0 ] ).to.deep.equal( [
				evtStub, vm.getEditor()
			] );

			wrapper.unmount();
		} );

		it( 'should emits #blur when the editor editable is blurred', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await waitForEditorToBeReady();

			const on = vm.getEditor().editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.secondCall.args[ 0 ] ).to.equal( 'blur' );
			expect( on.secondCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().blur ).to.be.undefined;

			on.secondCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().blur.length ).to.equal( 1 );
			expect( wrapper.emitted().blur[ 0 ] ).to.deep.equal( [
				evtStub, vm.getEditor()
			] );

			wrapper.unmount();
		} );
	} );

	function mountComponent( props ) {
		const wrapper = mount( CKEditorComponent, {
			props: {
				config: {},
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
