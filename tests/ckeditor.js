/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, setTimeout */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
import {
	MockEditor,
	ModelDocument,
	ViewDocument
} from './_utils/mockeditor';

describe( 'CKEditor Component', () => {
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'should have a name', () => {
		expect( CKEditorComponent.name ).to.equal( 'ckeditor' );
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
		expect( vm.$_instance ).to.be.null;
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
				expect( vm.$_instance ).to.be.instanceOf( MockEditor );

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

				expect( vm.$_instance.config.initialData ).to.equal( 'foo' );
				expect( vm.$_instance.setDataCounter ).to.equal( 0 );

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

		describe( '#disabled', () => {
			it( 'should be defined', async () => {
				const { wrapper, vm } = mountComponent();

				await nextTick();

				expect( vm.disabled ).to.be.false;

				wrapper.unmount();
			} );

			it( 'should set the initial editor#isReadOnly', async () => {
				const { wrapper, vm } = mountComponent( {
					disabled: true
				} );

				await nextTick();

				expect( vm.$_instance.isReadOnly ).to.be.true;
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

				expect( vm.$_instance.config ).to.deep.equal( { foo: 'bar' } );
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

		it( '#instance should be defined', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			expect( vm.$_instance ).to.be.instanceOf( MockEditor );

			wrapper.unmount();
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control editor#isReadOnly', async () => {
			const { wrapper, vm } = mountComponent( {
				disabled: true
			} );

			await nextTick();

			expect( vm.$_instance.isReadOnly ).to.be.true;

			wrapper.setProps( { disabled: false } );

			await nextTick();

			expect( vm.$_instance.isReadOnly ).to.be.false;

			wrapper.unmount();
		} );

		it( '#modelValue should trigger editor#setData', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			const spy = sandbox.spy( vm.$_instance, 'setData' );
			wrapper.setProps( { modelValue: 'foo' } );

			await nextTick();

			wrapper.setProps( { modelValue: 'bar' } );

			await nextTick();

			sinon.assert.calledTwice( spy );

			// Simulate typing: The #modelValue changes but at the same time, the instance update
			// its own data so instance.getData() and #modelValue are immediately the same.
			// Make sure instance.setData() is not called in this situation because it would destroy
			// the selection.
			wrapper.vm.$_lastEditorData = 'barq';
			wrapper.setProps( { modelValue: 'barq' } );

			await nextTick();

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWithExactly( spy.firstCall, 'foo' );
			sinon.assert.calledWithExactly( spy.secondCall, 'bar' );

			wrapper.unmount();
		} );
	} );

	describe( 'events', () => {
		it( 'should emit #ready when the editor is created', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			expect( wrapper.emitted().ready.length ).to.equal( 1 );
			expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.$_instance ] );

			wrapper.unmount();
		} );

		it( 'should emit #destroy when the editor is destroyed', async () => {
			const { wrapper, vm } = mountComponent();

			await nextTick();

			wrapper.unmount();

			expect( wrapper.emitted().destroy.length ).to.equal( 1 );
			expect( wrapper.emitted().destroy[ 0 ] ).to.deep.equal( [ vm.$_instance ] );
		} );

		describe( '#input event', () => {
			it( 'should be emitted but debounced when editor data changes', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );
				sandbox.stub( MockEditor.prototype, 'getData' ).returns( 'foo' );

				await nextTick();

				const on = vm.$_instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				await timeout( 350 );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.$_instance
				] );

				wrapper.unmount();
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/149
			it( 'should be emitted immediatelly despite being debounced', async () => {
				const { wrapper, vm } = mountComponent();

				sandbox.stub( ModelDocument.prototype, 'on' );
				sandbox.stub( MockEditor.prototype, 'getData' ).returns( 'foo' );

				await nextTick();

				const on = vm.$_instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				expect( wrapper.emitted().input.length ).to.equal( 1 );
				expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
					'foo', evtStub, vm.$_instance
				] );

				wrapper.unmount();
			} );
		} );

		it( 'should emit #focus when the editor editable is focused', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await nextTick();

			const on = vm.$_instance.editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.firstCall.args[ 0 ] ).to.equal( 'focus' );
			expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().focus ).to.be.undefined;

			on.firstCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().focus.length ).to.equal( 1 );
			expect( wrapper.emitted().focus[ 0 ] ).to.deep.equal( [
				evtStub, vm.$_instance
			] );

			wrapper.unmount();
		} );

		it( 'should emits #blur when the editor editable is blurred', async () => {
			const { wrapper, vm } = mountComponent();

			sandbox.stub( ViewDocument.prototype, 'on' );

			await nextTick();

			const on = vm.$_instance.editing.view.document.on;
			const evtStub = {};

			expect( on.calledTwice ).to.be.true;
			expect( on.secondCall.args[ 0 ] ).to.equal( 'blur' );
			expect( on.secondCall.args[ 1 ] ).to.be.a( 'function' );

			expect( wrapper.emitted().blur ).to.be.undefined;

			on.secondCall.args[ 1 ]( evtStub );

			expect( wrapper.emitted().blur.length ).to.equal( 1 );
			expect( wrapper.emitted().blur[ 0 ] ).to.deep.equal( [
				evtStub, vm.$_instance
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
