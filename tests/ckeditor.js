/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';

class ModelDocument {
	on() {}
};

class ViewlDocument {
	on() {}
};

class Editor {
	constructor( el, config ) {
		this.element = el;
		this.config = config;

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewlDocument()
			}
		};
	}

	setData() {}
	getData() {}
	destroy() { return Promise.resolve() }
}

Editor.create = ( el, config ) => {
	const editor = new Editor( el, config );

	return Promise.resolve( editor );
};

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
		const stub = sandbox.stub( Editor, 'create' ).resolves( new Editor() );
		const { wrapper } = createComponent();

		Vue.nextTick( () => {
			sinon.assert.calledOnce( stub );

			wrapper.destroy();
			done();
		} );
	} );

	it( 'calls editor#destroy when destroying', done => {
		const stub = sandbox.stub( Editor.prototype, 'destroy' ).resolves();
		const { wrapper, vm } = createComponent();

		Vue.nextTick( () => {
			wrapper.destroy();
			sinon.assert.calledOnce( stub );
			expect( vm.instance ).to.be.null;

			done();
		} );
	} );

	it( 'passes editor promise rejection error to console.error', done => {
		const error = new Error( 'Something went wrong.' );
		const consoleErrorStub = sandbox.stub( console, 'error' );

		sandbox.stub( Editor, 'create' ).rejects( error );

		const { wrapper, vm } = createComponent();

		setTimeout( () => {
			expect( consoleErrorStub.calledOnce ).to.be.true;
			expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );

			wrapper.destroy();
			done();
		} );
	} );

	describe( 'properties', () => {
		it( '#editor should be defined', () => {
			expect( vm.editor ).to.equal( 'classic' );
		} );

		describe( '#value', () => {
			it( 'should be defined', () => {
				expect( vm.value ).to.equal( '' );
			} );

			it( 'should set the initial data', done => {
				const setDataStub = sandbox.stub( Editor.prototype, 'setData' );
				const { wrapper, vm } = createComponent( {
					value: 'foo'
				} );

				Vue.nextTick( () => {
					sinon.assert.calledWithExactly( setDataStub, 'foo' );

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
			it( 'should not be defined', () => {
				expect( vm.config ).to.be.null;
			} );

			it( 'should set the initial editor#config', done => {
				const { wrapper, vm } = createComponent( {
					config: { foo: 'bar' }
				} );

				Vue.nextTick( () => {
					expect( vm.instance.config ).to.deep.equal( { foo: 'bar' } );
					wrapper.destroy();
					done();
				} );
			} );
		} );


		it( '#instance should be defined', done => {
			Vue.nextTick( () => {
				expect( vm.instance ).to.be.instanceOf( Editor );

				done();
			} );
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control editor#isReadOnly', done => {
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
			Vue.nextTick( () => {
				const spy = sandbox.spy( vm.instance, 'setData' );

				wrapper.setProps( { value: 'foo' } );
				wrapper.setProps( { value: 'bar' } );

				sinon.assert.calledTwice( spy );
				sinon.assert.calledWithExactly( spy.firstCall, 'foo' );
				sinon.assert.calledWithExactly( spy.secondCall, 'bar' );

				done();
			} );
		} );
	} );

	describe( 'events', () => {
		it( 'emits #ready when editor is created', done => {
			Vue.nextTick( () => {
				expect( wrapper.emitted().ready.length ).to.equal( 1 );
				expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.instance ] );

				done();
			} );

		} );

		it( 'emits #destroy when editor is destroyed', done => {
			const { wrapper, vm } = createComponent();

			Vue.nextTick( () => {
				wrapper.destroy();

				expect( wrapper.emitted().destroy.length ).to.equal( 1 );
				expect( wrapper.emitted().destroy[ 0 ] ).to.deep.equal( [ vm.instance ] );

				done();
			} );

		} );

		it( 'emits #input when editor data changes', done => {
			sandbox.stub( ModelDocument.prototype, 'on' );
			sandbox.stub( Editor.prototype, 'getData' ).returns( 'foo' );

			Vue.nextTick( () => {
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

				done();
			} );
		} );

		it( 'emits #focus when editor editable is focused', done => {
			sandbox.stub( ViewlDocument.prototype, 'on' );

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
			sandbox.stub( ViewlDocument.prototype, 'on' );

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
				editor: 'classic'
			}, props ),
			mocks: {
				_editorTypes: {
					classic: Editor
				}
			}
		} );

		return { wrapper, vm: wrapper.vm };
	}
} );
