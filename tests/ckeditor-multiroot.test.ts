/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import CkeditorElement from '../src/CkeditorElement.vue';
import CkeditorMultiRoot from '../src/CkeditorMultiRoot.vue';
import CkeditorMultiRootEditable from '../src/multiroot/MultiRootEditorEditable.vue';
import { ROOT_EDITABLE_OPTIONS_ATTRIBUTE } from '../src/multiroot/constants.js';
import { CkeditorPlugin } from '../src/plugin.js';
import { MockModelRootElement, MockMultiRootEditor } from './_utils/mockmultirooteditor.js';
import { turnOffErrors } from './_utils/turnofferrors.js';
import { CKEditorError, Essentials, MultiRootEditor, Paragraph } from 'ckeditor5';

class RealMultiRootEditor extends MultiRootEditor {
	public static override builtinPlugins = [ Essentials, Paragraph ];
	public static override defaultConfig = { licenseKey: 'GPL' };
}

describe( 'CKEditor multi-root component', () => {
	const rootsContent = {
		intro: '<h2>Intro</h2>',
		content: '<p>Content</p>'
	};
	const rootsAttributes = {
		intro: {
			order: 10
		},
		content: {
			order: 20
		}
	};

	beforeEach( () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '48.2.0' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	} );

	it( 'should initialize a multi-root editor and render UI and editables', async () => {
		const create = vi.spyOn( MockMultiRootEditor, 'create' );
		const component = mountComponent();

		await waitForEditor( component );

		expect( component.vm.instance ).to.be.instanceOf( MockMultiRootEditor );
		expect( component.emitted().ready![ 0 ] ).to.deep.equal( [ component.vm.instance ] );
		expect( component.find( '.ck-toolbar' ).exists() ).to.be.true;
		expect( component.find( '.ck-menu-bar' ).exists() ).to.be.true;
		expect( component.findAll( '.ck-editor__editable' ).length ).to.equal( 2 );
		expect( create ).toHaveBeenCalledWith( expect.objectContaining( {
			roots: {
				intro: {
					initialData: rootsContent.intro,
					modelAttributes: rootsAttributes.intro
				},
				content: {
					initialData: rootsContent.content,
					modelAttributes: rootsAttributes.content
				}
			}
		} ) );

		component.unmount();
	} );

	it( 'should emit ready after UI and editable elements are attached', async () => {
		let readyState: Record<string, boolean> | undefined;
		const component = mountComponent( {
			onReady: ( editor: MockMultiRootEditor ) => {
				readyState = {
					introEditable: editor.ui.getEditableElement( 'intro' ) instanceof HTMLElement,
					contentEditable: editor.ui.getEditableElement( 'content' ) instanceof HTMLElement,
					toolbar: editor.ui.view.toolbar.element.parentElement instanceof HTMLElement,
					menuBar: editor.ui.view.menuBarView.element.parentElement instanceof HTMLElement
				};
			}
		} );

		await vi.waitFor( () => {
			expect( readyState ).to.deep.equal( {
				introEditable: true,
				contentEditable: true,
				toolbar: true,
				menuBar: true
			} );
		} );

		component.unmount();
	} );

	it( 'should emit data updates when editor data changes', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );

		editor.data.set( {
			intro: '<h2>Changed</h2>'
		} );

		await timeout( 0 );

		expect( component.emitted()[ 'update:modelValue' ]![ 0 ] ).to.deep.equal( [
			{
				...rootsContent,
				intro: '<h2>Changed</h2>'
			},
			{},
			editor
		] );
		expect( component.emitted().input![ 0 ] ).to.deep.equal( component.emitted()[ 'update:modelValue' ]![ 0 ] );
		expect( component.emitted().change![ 0 ] ).to.deep.equal( [ {}, editor ] );

		component.unmount();
	} );

	it( 'should ignore stale modelValue echoes from debounced editor updates', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );

		editor.data.set( {
			intro: '<h2>First change</h2>'
		} );

		await timeout( 0 );

		editor.data.set( {
			intro: '<h2>Second change</h2>'
		} );

		const setData = vi.spyOn( editor.data, 'set' );

		await component.setProps( {
			modelValue: {
				...rootsContent,
				intro: '<h2>First change</h2>'
			}
		} );

		await timeout( 0 );

		expect( setData ).not.toHaveBeenCalled();
		expect( editor.getFullData().intro ).to.equal( '<h2>Second change</h2>' );

		component.unmount();
	} );

	it( 'should emit rootsAttributes updates when editor root attributes change', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const root = editor.model.document.getRoot( 'intro' )!;

		editor.model.change( writer => {
			writer.setAttributes( {
				order: 15,
				section: 'lead'
			}, root );
		} );

		await timeout( 0 );

		expect( component.emitted()[ 'update:rootsAttributes' ]![ 0 ] ).to.deep.equal( [
			{
				intro: {
					order: 15,
					section: 'lead'
				},
				content: rootsAttributes.content
			},
			{},
			editor
		] );

		component.unmount();
	} );

	it( 'should ignore stale rootsAttributes echoes from debounced editor updates', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const root = editor.model.document.getRoot( 'intro' )!;

		editor.model.change( writer => {
			writer.setAttributes( {
				order: 15
			}, root );
		} );

		await timeout( 0 );

		editor.model.change( writer => {
			writer.setAttributes( {
				order: 25
			}, root );
		} );

		await component.setProps( {
			rootsAttributes: {
				...rootsAttributes,
				intro: {
					order: 15
				}
			}
		} );

		await timeout( 0 );

		expect( editor.getRootAttributes( 'intro' ) ).to.deep.equal( {
			order: 25
		} );

		component.unmount();
	} );

	it( 'should normalize stale rootsAttributes echoes from debounced editor updates', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const root = editor.model.document.getRoot( 'intro' )!;

		editor.model.change( writer => {
			writer.setAttributes( {
				order: 15
			}, root );
		} );

		await timeout( 0 );

		await component.setProps( {
			rootsAttributes: {
				intro: {
					order: 15
				},
				content: rootsAttributes.content,
				ghost: {
					order: 99
				}
			}
		} );

		await vi.waitFor( () => {
			expect( component.vm.rootsAttributes.ghost ).to.be.undefined;
		} );
		expect( component.emitted()[ 'update:rootsAttributes' ]![ 1 ] ).to.deep.equal( [
			{
				intro: {
					order: 15
				},
				content: rootsAttributes.content
			},
			null,
			editor
		] );

		component.unmount();
	} );

	it( 'should synchronize external modelValue changes to the editor', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const setData = vi.spyOn( editor.data, 'set' );

		await component.setProps( {
			modelValue: {
				...rootsContent,
				intro: '<h2>Externally changed</h2>'
			}
		} );

		await vi.waitFor( () => {
			expect( setData ).toHaveBeenCalledWith( {
				intro: '<h2>Externally changed</h2>'
			}, expect.objectContaining( {
				suppressErrorInCollaboration: true
			} ) );
			expect( editor.getFullData().intro ).to.equal( '<h2>Externally changed</h2>' );
		} );

		component.unmount();
	} );

	it( 'should add and remove roots using exposed methods', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		await component.vm.addRoot( {
			name: 'outro',
			data: '<p>Outro</p>',
			attributes: {
				order: 30
			},
			editableOptions: {
				placeholder: 'Type here'
			}
		} );

		await vi.waitFor( () => {
			expect( component.vm.roots ).to.deep.equal( [ 'intro', 'content', 'outro' ] );
			expect( component.findAll( '.ck-editor__editable' ).length ).to.equal( 3 );
			expect( component.find( '[data-placeholder="Type here"]' ).exists() ).to.be.true;
		} );

		await component.vm.removeRoot( 'intro' );

		await vi.waitFor( () => {
			expect( component.vm.roots ).to.deep.equal( [ 'content', 'outro' ] );
			expect( component.findAll( '.ck-editor__editable' ).length ).to.equal( 2 );
			expect( component.vm.data.intro ).to.be.undefined;
			expect( component.vm.rootsAttributes.intro ).to.be.undefined;
		} );

		component.unmount();
	} );

	it( 'should bind disabled prop to read-only mode', async () => {
		const component = mountComponent( {
			disabled: true
		} );

		await waitForEditor( component );

		expect( component.vm.instance!.isReadOnly ).to.be.true;

		await component.setProps( {
			disabled: false
		} );

		await vi.waitFor( () => {
			expect( component.vm.instance!.isReadOnly ).to.be.false;
		} );

		component.unmount();
	} );

	it( 'should emit focus, blur and destroy lifecycle events', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );

		editor.editing.view.document.fire( 'focus', {} );
		editor.editing.view.document.fire( 'blur', {} );

		expect( component.emitted().focus![ 0 ] ).to.deep.equal( [ {}, editor ] );
		expect( component.emitted().blur![ 0 ] ).to.deep.equal( [ {}, editor ] );

		component.unmount();

		expect( component.emitted().destroy![ 0 ] ).to.deep.equal( [ editor ] );
	} );

	it( 'should emit initialization errors', async () => {
		const error = new Error( 'Initialization failed.' );
		vi.spyOn( MockMultiRootEditor, 'create' ).mockRejectedValue( error );
		vi.spyOn( console, 'error' ).mockReturnValue();

		const component = mountComponent();

		await vi.waitFor( () => {
			expect( component.emitted().error![ 0 ] ).to.deep.equal( [ error, { phase: 'initialization' } ] );
		} );
		expect( console.error ).toHaveBeenCalledWith( error );

		component.unmount();
	} );

	it( 'should synchronize external root and rootsAttributes changes to the editor', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const addRoot = vi.spyOn( editor, 'addRoot' );
		const detachRoot = vi.spyOn( editor, 'detachRoot' );

		await component.setProps( {
			modelValue: {
				...rootsContent,
				outro: '<p>Outro</p>'
			},
			rootsAttributes: {
				...rootsAttributes,
				outro: {
					order: 30,
					[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: {
						placeholder: 'Synced placeholder'
					}
				}
			}
		} );

		await vi.waitFor( () => {
			expect( addRoot ).toHaveBeenCalledWith( 'outro', expect.objectContaining( {
				initialData: '<p>Outro</p>',
				modelAttributes: {
					order: 30,
					[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: { placeholder: 'Synced placeholder' }
				}
			} ) );
			expect( component.vm.roots ).to.deep.equal( [ 'intro', 'content', 'outro' ] );

			// The editable options must reach the rendered editable, so the placeholder is applied to the new root.
			expect( component.find( '[data-placeholder="Synced placeholder"]' ).exists() ).to.be.true;
		} );

		await component.setProps( {
			rootsAttributes: {
				...rootsAttributes,
				intro: {
					order: 15,
					section: 'lead',
					[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: {
						placeholder: 'Ignored placeholder'
					}
				},
				outro: {
					order: 30
				}
			}
		} );

		await vi.waitFor( () => {
			expect( editor.getRootAttributes( 'intro' ) ).to.deep.equal( {
				order: 15,
				section: 'lead',
				[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: { placeholder: 'Ignored placeholder' }
			} );
		} );

		// Updating editable options of an existing root does not re-create its editable, so the placeholder is not applied.
		expect( component.find( '[data-placeholder="Ignored placeholder"]' ).exists() ).to.be.false;

		await component.setProps( {
			modelValue: {
				content: rootsContent.content,
				outro: '<p>Outro</p>'
			},
			rootsAttributes: {
				content: rootsAttributes.content,
				outro: {
					order: 30
				}
			}
		} );

		await vi.waitFor( () => {
			expect( detachRoot ).toHaveBeenCalledWith( 'intro', true );
			expect( component.vm.roots ).to.deep.equal( [ 'content', 'outro' ] );
		} );

		component.unmount();
	} );

	it( 'should reuse attributes of a root that still exists in the model when re-adding it through props', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const addRoot = vi.spyOn( editor, 'addRoot' );
		const detachedRoot = new MockModelRootElement( 'outro', { order: 30 } );

		detachedRoot.detach();
		( editor as any )._roots.outro = detachedRoot;

		await component.setProps( {
			modelValue: {
				...rootsContent,
				outro: '<p>Outro</p>'
			}
		} );

		await vi.waitFor( () => {
			expect( addRoot ).toHaveBeenCalledWith( 'outro', expect.objectContaining( {
				initialData: '<p>Outro</p>',
				modelAttributes: {
					order: 30
				}
			} ) );
		} );

		component.unmount();
	} );

	it( 'should not reset root attributes when editor omits an empty attributes entry', async () => {
		const component = mountComponent( {
			rootsAttributes: {
				intro: rootsAttributes.intro,
				content: {}
			}
		} );

		await waitForEditor( component );

		const editor = getEditor( component );
		const originalChange = editor.model.change;
		const setAttributes = vi.fn();

		vi.spyOn( editor, 'getRootsAttributes' ).mockReturnValue( {
			intro: rootsAttributes.intro
		} );

		editor.model.change = ( callback: Function ) => originalChange( ( writer: any ) => callback( {
			...writer,
			setAttributes: ( ...args: Array<any> ) => {
				setAttributes( ...args );

				return writer.setAttributes( ...args );
			}
		} ) );

		await component.setProps( {
			rootsAttributes: {
				intro: rootsAttributes.intro,
				content: {}
			}
		} );

		await timeout( 0 );

		expect( setAttributes ).not.toHaveBeenCalled();

		component.unmount();
	} );

	it( 'should preserve existing root attributes when external rootsAttributes update is partial', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );

		await component.setProps( {
			rootsAttributes: {
				intro: {
					section: 'lead'
				}
			}
		} );

		await vi.waitFor( () => {
			expect( editor.getRootAttributes( 'intro' ) ).to.deep.equal( {
				order: 10,
				section: 'lead'
			} );
			expect( editor.getRootAttributes( 'content' ) ).to.deep.equal( rootsAttributes.content );
		} );

		expect( component.emitted()[ 'update:rootsAttributes' ]![ 0 ] ).to.deep.equal( [
			{
				intro: {
					order: 10,
					section: 'lead'
				},
				content: rootsAttributes.content
			},
			null,
			editor
		] );

		component.unmount();
	} );

	it( 'should keep root list in sync when two-way binding is disabled', async () => {
		const component = mountComponent( {
			disableTwoWayDataBinding: true
		} );

		await waitForEditor( component );

		const editor = getEditor( component );

		editor.data.set( {
			intro: '<h2>Ignored</h2>'
		} );

		await timeout( 0 );

		expect( component.vm.data.intro ).to.equal( rootsContent.intro );

		editor.addRoot( 'outro', { initialData: '<p>Outro</p>' } );

		await vi.waitFor( () => {
			expect( component.vm.roots ).to.deep.equal( [ 'intro', 'content', 'outro' ] );
			expect( component.vm.data.outro ).to.be.undefined;
			expect( component.vm.rootsAttributes.outro ).to.be.undefined;
		} );

		editor.detachRoot( 'intro' );

		await vi.waitFor( () => {
			expect( component.vm.roots ).to.deep.equal( [ 'content', 'outro' ] );
			expect( component.vm.data.intro ).to.equal( rootsContent.intro );
		} );

		component.unmount();
	} );

	it( 'should reject pending root operations when initialization fails', async () => {
		const error = new Error( 'Initialization failed.' );
		let rejectCreate!: ( error: Error ) => void;

		class SlowFailingMultiRootEditor extends MockMultiRootEditor {
			public static override async create( ...args: Array<any> ): Promise<MockMultiRootEditor> {
				await new Promise<void>( ( _resolve, reject ) => {
					rejectCreate = reject;
				} );

				return super.create( ...args );
			}
		}

		vi.spyOn( console, 'error' ).mockReturnValue();

		const component = mountComponent( {
			editor: SlowFailingMultiRootEditor as any
		} );

		await timeout( 0 );

		const addRootPromise = component.vm.addRoot( {
			name: 'outro'
		} );

		rejectCreate( error );

		await expect( addRootPromise ).rejects.to.equal( error );

		component.unmount();
	} );

	it( 'should support legacy multi-root create and addRoot signatures', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '47.0.0' );
		const create = vi.spyOn( MockMultiRootEditor, 'create' );
		const component = mountComponent();

		await waitForEditor( component );

		expect( create ).toHaveBeenCalledWith( rootsContent, expect.objectContaining( {
			rootsAttributes
		} ) );

		const editor = getEditor( component );
		const addRoot = vi.spyOn( editor, 'addRoot' );

		await component.vm.addRoot( {
			name: 'outro',
			data: '<p>Outro</p>',
			editableOptions: {
				placeholder: 'Legacy placeholder'
			}
		} );

		expect( addRoot ).toHaveBeenCalledWith( 'outro', expect.objectContaining( {
			data: '<p>Outro</p>',
			attributes: {
				$rootEditableOptions: {
					placeholder: 'Legacy placeholder'
				}
			}
		} ) );

		await component.setProps( {
			rootsAttributes: {
				...rootsAttributes,
				intro: {
					order: 15,
					[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: {
						placeholder: 'Legacy synced placeholder'
					}
				}
			}
		} );

		await vi.waitFor( () => {
			expect( editor.getRootAttributes( 'intro' ) ).to.deep.equal( {
				order: 15,
				[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: {
					placeholder: 'Legacy synced placeholder'
				}
			} );
		} );

		await component.setProps( {
			modelValue: {
				...rootsContent,
				appendix: '<p>Appendix</p>'
			},
			rootsAttributes: {
				...rootsAttributes,
				appendix: {}
			}
		} );

		await vi.waitFor( () => {
			expect( addRoot ).toHaveBeenCalledWith( 'appendix', expect.objectContaining( {
				data: '<p>Appendix</p>',
				attributes: {}
			} ) );
		} );

		component.unmount();
	} );

	it( 'should apply modelValue changes made while editor is still initializing', async () => {
		let resolveCreate!: () => void;

		class SlowMultiRootEditor extends MockMultiRootEditor {
			public static override async create( ...args: Array<any> ): Promise<MockMultiRootEditor> {
				await new Promise<void>( resolve => {
					resolveCreate = resolve;
				} );

				return super.create( ...args );
			}
		}

		const component = mountComponent( {
			editor: SlowMultiRootEditor as any
		} );

		await timeout( 0 );
		const addRootPromise = component.vm.addRoot( {
			name: 'outro',
			data: '<p>Outro</p>'
		} );

		await component.setProps( {
			modelValue: {
				intro: '<h2>Pending</h2>',
				content: rootsContent.content
			}
		} );

		resolveCreate();

		await addRootPromise;
		await waitForEditor( component );

		expect( component.vm.instance!.getFullData().intro ).to.equal( '<h2>Pending</h2>' );
		expect( component.vm.instance!.getFullData().outro ).to.equal( '<p>Outro</p>' );

		component.unmount();
	} );

	it( 'should destroy editors that resolve after component unmounts', async () => {
		let resolveCreate!: () => void;
		let editor!: MockMultiRootEditor;

		class SlowMultiRootEditor extends MockMultiRootEditor {
			public static override async create( ...args: Array<any> ): Promise<MockMultiRootEditor> {
				await new Promise<void>( resolve => {
					resolveCreate = resolve;
				} );

				editor = await super.create( ...args );

				return editor;
			}
		}

		const component = mountComponent( {
			editor: SlowMultiRootEditor as any
		} );

		await timeout( 0 );
		const addRootPromise = component.vm.addRoot( {
			name: 'outro'
		} );

		component.unmount();

		await expect( addRootPromise ).rejects.toThrow( 'The editor was destroyed before it became ready.' );
		await expect( component.vm.addRoot( {
			name: 'late'
		} ) ).rejects.toThrow( 'The editor was destroyed before it became ready.' );

		resolveCreate();

		await vi.waitFor( () => {
			expect( editor.state ).to.equal( 'destroyed' );
		} );
	} );

	it( 'should ignore detached roots reported by the differ', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const detachedRoot = new MockModelRootElement( 'detached', {} );

		detachedRoot.detach();
		editor.model.document.differ.setChanges( [ {
			type: 'insert',
			position: {
				root: detachedRoot
			}
		} ], [ {
			name: 'intro',
			state: 'detached'
		} ] );
		editor.model.document.fire( 'change:data', {} );
		editor.model.document.differ.clear();

		await timeout( 0 );

		expect( component.vm.data ).to.deep.equal( rootsContent );

		editor.model.document.differ.setChanges( [ {
			type: 'attribute',
			range: {
				root: editor.model.document.getRoot( 'intro' )
			}
		} ], [] );
		editor.model.document.fire( 'change:data', {} );
		editor.model.document.differ.clear();

		await timeout( 0 );

		expect( component.emitted()[ 'update:modelValue' ] ).to.be.undefined;

		component.unmount();
	} );

	it( 'should initialize without explicit rootsAttributes', async () => {
		const component = mountComponent( {
			rootsAttributes: undefined
		} );

		await waitForEditor( component );

		expect( component.vm.rootsAttributes ).to.deep.equal( {
			intro: {},
			content: {}
		} );

		await component.vm.addRoot( {
			name: 'empty'
		} );

		await vi.waitFor( () => {
			expect( component.vm.data.empty ).to.equal( '' );
		} );

		component.unmount();
	} );

	it( 'should drop rootsAttributes entries for roots that are not present in data', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		await component.setProps( {
			rootsAttributes: {
				...rootsAttributes,
				ghost: {
					order: 99
				}
			}
		} );

		await vi.waitFor( () => {
			expect( component.vm.rootsAttributes.ghost ).to.be.undefined;
			expect( Object.keys( component.vm.rootsAttributes ) ).to.deep.equal( [ 'intro', 'content' ] );
		} );
		expect( component.emitted()[ 'update:rootsAttributes' ]![ 0 ] ).to.deep.equal( [
			rootsAttributes,
			null,
			getEditor( component )
		] );

		component.unmount();
	} );

	it( 'should normalize rootsAttributes before the editor is initialized', async () => {
		const create = vi.spyOn( MockMultiRootEditor, 'create' );
		let resolveCreate!: ( editor: MockMultiRootEditor ) => void;

		create.mockImplementationOnce( config => new Promise( resolve => {
			resolveCreate = resolve;

			setTimeout( () => {
				resolve( new MockMultiRootEditor( config ) );
			}, 0 );
		} ) );

		const component = mountComponent( {
			rootsAttributes: {
				...rootsAttributes,
				ghost: {
					order: 99
				}
			}
		} );

		await component.setProps( {
			rootsAttributes: {
				...rootsAttributes,
				ghost: {
					order: 100
				}
			}
		} );

		await vi.waitFor( () => {
			expect( component.vm.rootsAttributes.ghost ).to.be.undefined;
		} );

		resolveCreate( new MockMultiRootEditor( create.mock.calls[ 0 ][ 0 ] ) );

		await waitForEditor( component );

		expect( component.vm.rootsAttributes ).to.deep.equal( rootsAttributes );

		component.unmount();
	} );

	it( 'should attach fake editable elements before destroying orphaned roots', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );

		editor.editing.view.domRoots.delete( 'intro' );
		component.unmount();

		expect( editor.editing.view.getDomRoot( 'intro' ) ).to.be.instanceOf( HTMLElement );
	} );

	it( 'should tolerate missing UI elements and detached UI on unmount', async () => {
		const toolbarElement = document.createElement( 'div' );
		const menuBarElement = document.createElement( 'div' );

		toolbarElement.classList.add( 'ck-toolbar' );
		menuBarElement.classList.add( 'ck-menu-bar' );

		const editorWithoutToolbar = {
			ui: {
				view: {
					toolbar: {
						element: null
					},
					menuBarView: {
						element: null
					}
				}
			}
		};
		const editorWithToolbar = {
			ui: {
				view: {
					toolbar: {
						element: toolbarElement
					},
					menuBarView: {
						element: menuBarElement
					}
				}
			}
		};

		const emptyUI = mount( CkeditorElement, {
			props: {
				editor: editorWithoutToolbar as any
			}
		} );
		const menuBarUI = mount( CkeditorElement, {
			props: {
				editor: editorWithToolbar as any,
				element: 'menuBar'
			}
		} );
		const toolbarUI = mount( CkeditorElement, {
			props: {
				editor: editorWithToolbar as any
			}
		} );

		await timeout( 0 );

		expect( menuBarUI.find( '.ck-menu-bar' ).exists() ).to.be.true;
		expect( toolbarUI.find( '.ck-toolbar' ).exists() ).to.be.true;

		toolbarElement.remove();
		menuBarElement.remove();
		expect( () => menuBarUI.unmount() ).not.to.throw();
		expect( () => toolbarUI.unmount() ).not.to.throw();
		expect( () => emptyUI.unmount() ).not.to.throw();
	} );

	it( 'should detach an already attached editable before re-attaching it', async () => {
		const component = mountComponent();

		await waitForEditor( component );

		const editor = getEditor( component );
		const editable = mount( CkeditorMultiRootEditable, {
			props: {
				id: 'custom-intro',
				editor: editor as any,
				rootName: 'intro'
			}
		} );

		await vi.waitFor( () => {
			expect( editor.ui.getEditableElement( 'intro' )?.id ).to.equal( 'custom-intro' );
		} );

		editable.unmount();

		expect( editor.ui.getEditableElement( 'intro' ) ).to.be.undefined;

		const editableWithoutId = mount( CkeditorMultiRootEditable, {
			props: {
				editor: editor as any,
				rootName: 'content'
			}
		} );

		await vi.waitFor( () => {
			expect( editor.ui.getEditableElement( 'content' )?.id ).to.equal( 'content' );
		} );

		editableWithoutId.unmount();

		component.unmount();
	} );

	it( 'should expose multi-root components from the plugin', () => {
		const app = {
			component: vi.fn()
		};

		CkeditorPlugin.install( app as any );

		expect( app.component ).toHaveBeenCalledWith( 'CkeditorElement', expect.any( Object ) );
		expect( app.component ).toHaveBeenCalledWith( 'CkeditorMultiRoot', expect.any( Object ) );
		expect( app.component ).toHaveBeenCalledWith( 'CkeditorMultiRootEditable', expect.any( Object ) );
	} );

	// A real editor, unlike the mock used elsewhere in this file: reporting finds the editor an error
	// belongs to among the editors that are actually running, and a mock is not one of them.
	describe( 'error reporting', () => {
		beforeEach( () => {
			// These mount real editors, so they should run on a version the integration supports.
			vi.stubGlobal( 'CKEDITOR_VERSION', '49.0.0' );
		} );

		function mountReal( props: Record<string, any> = {} ) {
			return mount( CkeditorMultiRoot, {
				props: {
					editor: RealMultiRootEditor as any,
					modelValue: { intro: '<p>Foo</p>' },
					onError: () => {},
					...props
				}
			} );
		}

		async function waitForReal( component: any ): Promise<MultiRootEditor> {
			await vi.waitFor( () => {
				expect( component.vm.instance ).to.be.instanceOf( RealMultiRootEditor );
			} );

			return component.vm.instance as MultiRootEditor;
		}

		it( 'should report a runtime error and keep the same editor', async () => {
			const component = mountReal();
			const editor = await waitForReal( component );
			const error = new CKEditorError( 'a-custom-error', editor );

			await turnOffErrors( () => {
				setTimeout( () => {
					throw error;
				} );
			} );

			await vi.waitFor( () => {
				expect( component.emitted().error![ 0 ] ).to.deep.equal( [ error, {
					phase: 'runtime',
					editor
				} ] );
			} );

			// Nothing restarts, so the editor the component holds is the one that threw.
			expect( component.vm.instance ).to.equal( editor );

			component.unmount();
		} );

		// One registration serves the whole page, so every component hears about every editor. This is
		// what keeps an error with the editor it came from.
		it( 'should not report an error that came from another editor', async () => {
			const component = mountReal();
			const other = mountReal();

			await waitForReal( component );

			const otherEditor = await waitForReal( other );
			const error = new CKEditorError( 'a-custom-error', otherEditor );

			await turnOffErrors( () => {
				setTimeout( () => {
					throw error;
				} );
			} );

			// The editor the error came from heard about it. Without this, the assertion below would hold
			// just as well for an error that was never reported to anyone.
			await vi.waitFor( () => {
				expect( other.emitted().error![ 0 ] ).to.deep.equal( [ error, {
					phase: 'runtime',
					editor: otherEditor
				} ] );
			} );

			expect( component.emitted().error ).to.be.undefined;

			component.unmount();
			other.unmount();
		} );

		// The guard inside the callback and the unsubscribe hide each other: with either one alone the
		// component still looks silent after unmounting. Only the unsubscribe stops the page-level
		// listeners from being retained, so it is asserted on its own.
		it( 'should unregister the reporting when the component is unmounted', async () => {
			const off = vi.fn();
			const register = vi.spyOn( RealMultiRootEditor, 'onEditorError' ).mockReturnValue( off );
			const component = mountReal();

			await waitForReal( component );

			expect( register ).toHaveBeenCalledOnce();
			expect( off ).not.toHaveBeenCalled();

			component.unmount();

			expect( off ).toHaveBeenCalledOnce();
		} );

		it( 'should stop reporting once the component is unmounted', async () => {
			const component = mountReal();
			const editor = await waitForReal( component );

			component.unmount();

			await turnOffErrors( () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
				} );
			} );

			expect( component.emitted().error ).to.be.undefined;
		} );
	} );

	function mountComponent( props: Record<string, any> = {} ) {
		return mount( CkeditorMultiRoot, {
			props: {
				editor: MockMultiRootEditor as any,
				modelValue: rootsContent,
				rootsAttributes,
				...props
			}
		} );
	}
} );

async function waitForEditor( component: any ) {
	await vi.waitFor( () => {
		expect( component.vm.instance ).to.be.instanceOf( MockMultiRootEditor );
	} );
}

function getEditor( component: any ): MockMultiRootEditor {
	return component.vm.instance as unknown as MockMultiRootEditor;
}

function timeout( delay: number ) {
	return new Promise( resolve => setTimeout( resolve, delay ) );
}
