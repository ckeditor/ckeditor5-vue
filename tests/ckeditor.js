/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
 
import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';

class Editor {
	constructor( el, config ) {
		this.element = el;
		this.config = config;

		this.model = {
			document: {
				on: () => {}
			}
		};
		
		this.editing = {
			view: {
				document: {
					on: () => {}
				}
			}
		};
	}

	setData() {}
	getData() {}
	destroy() {}
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

	it( 'emits "ready" when editor is created', done => {
		Vue.nextTick( () => {
			expect( wrapper.emitted().ready.length ).to.equal( 1 );
			expect( wrapper.emitted().ready[ 0 ] ).to.deep.equal( [ vm.instance ] );
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
