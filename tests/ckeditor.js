/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, setTimeout */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
import {
	MockEditor,
	ModelDocument,
	ViewDocument
} from './_utils/mockeditor';

describe( 'CKEditor Component', () => {
	let sandbox, wrapper, vm;

	beforeEach( () => {
		( { wrapper, vm } = createComponent() );

		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		sandbox.restore();
		wrapper.destroy();
	} );

	it( 'component should have a name', () => {
		expect( CKEditorComponent.name ).to.equal( 'ckeditor' );
	} );

	it( 'calls editor#create when initializing', done => {
		Vue.config.errorHandler = done;

		const stub = sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );
		const { wrapper } = createComponent();

		Vue.nextTick( () => {
			sinon.assert.calledOnce( stub );

			wrapper.destroy();
			done();
		} );
	} );

	it( 'calls editor#destroy when destroying', done => {
		Vue.config.errorHandler = done;

		const stub = sandbox.stub( MockEditor.prototype, 'destroy' ).resolves();
		const { wrapper, vm } = createComponent();

		Vue.nextTick( () => {
			wrapper.destroy();
			sinon.assert.calledOnce( stub );
			expect( vm.instance ).to.be.null;

			done();
		} );
	} );

	it( 'passes editor promise rejection error to console.error', done => {
		Vue.config.errorHandler = done;

		const error = new Error( 'Something went wrong.' );
		const consoleErrorStub = sandbox.stub( console, 'error' );

		sandbox.stub( MockEditor, 'create' ).rejects( error );

		const { wrapper } = createComponent();

		setTimeout( () => {
			consoleErrorStub.restore();

			expect( consoleErrorStub.calledOnce ).to.be.true;
			expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );

			wrapper.destroy();
			done();
		} );
	} );

	describe( 'properties', () => {
		it( '#editor', () => {
			it( 'accepts a string', done => {
				Vue.config.errorHandler = done;

				expect( vm.editor ).to.equal( 'classic' );

				Vue.nextTick( () => {
					expect( vm.instance ).to.be.instanceOf( MockEditor );

					done();
				} );
			} );

			it( 'accepts an editor constructor', done => {
				Vue.config.errorHandler = done;

				const { wrapper, vm } = createComponent( {
					editor: MockEditor
				} );

				Vue.nextTick( () => {
					expect( vm.editor ).to.equal( MockEditor );
					expect( vm.instance ).to.be.instanceOf( MockEditor );

					wrapper.destroy();
					done();
				} );
			} );
		} );

		describe( '#value', () => {
			it( 'should be defined', () => {
				expect( vm.value ).to.equal( '' );
			} );

			// See: https://github.com/ckeditor/ckeditor5-vue/issues/47.
			it( 'should set the initial data', done => {
				Vue.config.errorHandler = done;

				const { wrapper, vm } = createComponent( {
					value: 'foo'
				} );

				Vue.nextTick( () => {
					expect( vm.instance.config.initialData ).to.equal( 'foo' );
					expect( vm.instance.setDataCounter ).to.equal( 0 );

					wrapper.destroy();
					done();
				} );
			} );
		} );

		describe( '#tagName', () => {
			it( 'should be defined', () => {
				expect( vm.tagName ).to.equal( 'div' );
			} );

			it( 'should define the tag of the element', () => {
				const { wrapper, vm } = createComponent( {
					tagName: 'textarea'
				} );

				expect( vm.$el.tagName ).to.equal( 'TEXTAREA' );

				wrapper.destroy();
			} );
		} );

		describe( '#disabled', () => {
			it( 'should be defined', () => {
				expect( vm.disabled ).to.be.false;
			} );

			it( 'should set the initial editor#isReadOnly', done => {
				Vue.config.errorHandler = done;

				const { wrapper, vm } = createComponent( {
					disabled: true
				} );

				Vue.nextTick( () => {
					expect( vm.instance.isReadOnly ).to.be.true;
					wrapper.destroy();
					done();
				} );
			} );
		} );

		describe( '#config', () => {
			it( 'should be empty', () => {
				expect( vm.config ).to.deep.equal( {} );
			} );

			it( 'should set the initial editor#config', done => {
				Vue.config.errorHandler = done;

				const { wrapper, vm } = createComponent( {
					config: { foo: 'bar' }
				} );

				Vue.nextTick( () => {
					expect( vm.instance.config ).to.deep.equal( { foo: 'bar' } );
					wrapper.destroy();
					done();
				} );
			} );

			// https://github.com/ckeditor/ckeditor5-vue/issues/101
			it( 'should not be mutated', done => {
				const createStub = sandbox.stub( MockEditor, 'create' ).resolves( new MockEditor() );

				const ParentComponent = {
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

				const { vm } = mount( ParentComponent, {
					stubs: {
						ckeditor: CKEditorComponent
					}
				} );

				Vue.nextTick( () => {
					const fooEditorConfig = createStub.firstCall.args[ 1 ];
					const barEditorConfig = createStub.secondCall.args[ 1 ];
					const bazEditorConfig = createStub.thirdCall.args[ 1 ];

					expect( fooEditorConfig ).to.not.equal( barEditorConfig );
					expect( fooEditorConfig ).to.not.equal( bazEditorConfig );
					expect( barEditorConfig ).to.not.equal( bazEditorConfig );

					expect( vm.editorConfig.initialData ).to.be.undefined;

					wrapper.destroy();
					done();
				} );
			} );
		} );

		it( '#instance should be defined', done => {
			Vue.config.errorHandler = done;

			Vue.nextTick( () => {
				expect( vm.instance ).to.be.instanceOf( MockEditor );

				done();
			} );
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control editor#isReadOnly', done => {
			Vue.config.errorHandler = done;

			const { wrapper, vm } = createComponent( {
				disabled: true
			} );

			Vue.nextTick( () => {
				expect( vm.instance.isReadOnly ).to.be.true;

				wrapper.setProps( { disabled: false } );
				expect( vm.instance.isReadOnly ).to.be.false;

				wrapper.destroy();
				done();
			} );
		} );

		it( '#value should trigger editor#setData', done => {
			Vue.config.errorHandler = done;

			Vue.nextTick( () => {
				const spy = sandbox.spy( vm.instance, 'setData' );

				wrapper.setProps( { value: 'foo' } );
				wrapper.setProps( { value: 'bar' } );
				wrapper.setProps( { value: 'bar' } );

				sinon.assert.calledTwice( spy );

				// Simulate typing: The #value changes but at the same time, the instance update
				// its own data so instance.getData() and #value are immediately the same.
				// Make sure instance.setData() is not called in this situation because it would destroy
				// the selection.
				wrapper.vm.$_lastEditorData = 'barq';
				wrapper.setProps( { value: 'barq' } );

				sinon.assert.calledTwice( spy );
				sinon.assert.calledWithExactly( spy.firstCall, 'foo' );
				sinon.assert.calledWithExactly( spy.secondCall, 'bar' );

				done();
			} );
		} );
	} );

	describe( 'events', () => {
		it( 'emits #ready when editor is created', done => {
			Vue.config.errorHandler = done;

			Vue.nextTick( () => {
				expect( wrapper.emitted().ready.length ).to.equal( 1 );
				expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.instance ] );

				done();
			} );
		} );

		it( 'emits #destroy when editor is destroyed', done => {
			Vue.config.errorHandler = done;

			const { wrapper, vm } = createComponent();

			Vue.nextTick( () => {
				wrapper.destroy();

				expect( wrapper.emitted().destroy.length ).to.equal( 1 );
				expect( wrapper.emitted().destroy[ 0 ] ).to.deep.equal( [ vm.instance ] );

				done();
			} );
		} );

		it( 'emits debounced #input when editor data changes', done => {
			Vue.config.errorHandler = done;

			sandbox.stub( ModelDocument.prototype, 'on' );
			sandbox.stub( MockEditor.prototype, 'getData' ).returns( 'foo' );

			Vue.nextTick( () => {
				const on = vm.instance.model.document.on;
				const evtStub = {};

				expect( on.calledOnce ).to.be.true;
				expect( on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
				expect( on.firstCall.args[ 1 ] ).to.be.a( 'function' );

				expect( wrapper.emitted().input ).to.be.undefined;

				on.firstCall.args[ 1 ]( evtStub );

				setTimeout( () => {
					expect( wrapper.emitted().input.length ).to.equal( 1 );
					expect( wrapper.emitted().input[ 0 ] ).to.deep.equal( [
						'foo', evtStub, vm.instance
					] );

					done();
				}, 350 );
			} );
		} );

		it( 'emits #focus when editor editable is focused', done => {
			Vue.config.errorHandler = done;

			sandbox.stub( ViewDocument.prototype, 'on' );

			Vue.nextTick( () => {
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

				done();
			} );
		} );

		it( 'emits #blur when editor editable is focused', done => {
			Vue.config.errorHandler = done;

			sandbox.stub( ViewDocument.prototype, 'on' );

			Vue.nextTick( () => {
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

				done();
			} );
		} );
	} );

	function createComponent( props ) {
		const wrapper = mount( CKEditorComponent, {
			propsData: Object.assign( {}, {
				editor: MockEditor
			}, props )
		} );

		return { wrapper, vm: wrapper.vm };
	}
} );
