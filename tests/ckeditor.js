/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
 
import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';

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

	setData() {

	}

	getData() {

	}

	destroy() {

	}
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
	
	describe( 'properties', () => {
		it( '#editor should be defined', () => {
			expect( vm.editor ).to.equal( 'classic' );
		} );
		
		it( '#value should be defined', () => {
			expect( vm.value ).to.equal( '' );
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

				vm.$nextTick( () => {
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

				vm.$nextTick( () => {
					expect( vm.instance.config ).to.deep.equal( { foo: 'bar' } );
					wrapper.destroy();
					done();
				} );
			} );			
		} );
			

		it( '#instance should be defined', done => {
			vm.$nextTick( () => {
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

			vm.$nextTick( () => {
				expect( vm.instance.isReadOnly ).to.be.true;
				
				wrapper.setProps( { disabled: false } );
				expect( vm.instance.isReadOnly ).to.be.false;

				wrapper.destroy();
				done();
			} );
		} );

		it( '#value should trigger editor#setData', done => {
			vm.$nextTick( () => {
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
