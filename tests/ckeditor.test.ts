/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, afterEach, it, expect, vi, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, KeepAlive, nextTick, ref, type VNode } from 'vue';
import type { EditorRelaxedConfig } from '@ckeditor/ckeditor5-integrations-common';

import { Ckeditor } from '../src/plugin.js';
import { turnOffErrors } from './_utils/turnofferrors.js';
import { REPORTING_UNAVAILABLE_WARNING } from '../src/composables/useEditorVersionCheck.js';
import { CKEditorError, ClassicEditor, Essentials, Paragraph } from 'ckeditor5';

class RealClassicEditor extends ClassicEditor {
	public static override builtinPlugins = [ Essentials, Paragraph ];
	public static override defaultConfig = { licenseKey: 'GPL' };
}
import { VueIntegrationUsageDataPlugin } from '../src/plugins/VueIntegrationUsageDataPlugin.js';
import {
	MockEditor,
	ModelDocument,
	ViewDocument
} from './_utils/mockeditor.js';

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

		await timeout( 0 );
		component.unmount();

		expect( consoleWarn ).toHaveBeenCalledOnce();
		expect( consoleWarn ).toHaveBeenNthCalledWith( 1,
			'Cannot find the "CKEDITOR_VERSION" in the "window" scope.'
		);
	} );

	it( 'should print a warning if using CKEditor 5 in version lower than 49', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '30.0.0' );

		const consoleWarn = vi.spyOn( console, 'warn' ).mockReturnValue();
		const component = mountComponent();

		await timeout( 0 );
		component.unmount();

		expect( consoleWarn ).toHaveBeenCalledOnce();
		expect( consoleWarn ).toHaveBeenNthCalledWith( 1,
			'The <CKEditor> component requires using CKEditor 5 in version 49+ or nightly build.'
		);
	} );

	it( 'should not print any warning if using CKEditor 5 in version 49 or higher', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '49.0.0' );

		const consoleWarn = vi.spyOn( console, 'warn' );
		const component = mountComponent();

		await timeout( 0 );
		component.unmount();

		expect( consoleWarn ).not.toHaveBeenCalledOnce();
	} );

	it( 'should not print any warning if using nightly build of CKEditor 5', async () => {
		vi.stubGlobal( 'CKEDITOR_VERSION', '0.0.0-nightly' );

		const consoleWarn = vi.spyOn( console, 'warn' );
		const component = mountComponent();

		await timeout( 0 );
		component.unmount();

		expect( consoleWarn ).not.toHaveBeenCalledOnce();
	} );

	it( 'should call editor#create when initializing', async () => {
		const stub = vi.spyOn( MockEditor, 'create' );
		const component = mountComponent();

		await timeout( 0 );
		component.unmount();

		expect( stub ).toHaveBeenCalledOnce();
	} );

	it( 'should call editor#destroy when destroying', async () => {
		const stub = vi.spyOn( MockEditor.prototype, 'destroy' );
		const component = mountComponent();

		await timeout( 0 );
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

				await timeout( 0 );

				expect( component.vm.editor ).to.equal( MockEditor );
				expect( component.vm.instance ).to.be.instanceOf( MockEditor );

				component.unmount();
			} );
		} );

		describe( '#modelValue', () => {
			it( 'should be defined', async () => {
				const component = mountComponent();

				await timeout( 0 );

				expect( component.vm.modelValue ).to.equal( '' );

				component.unmount();
			} );

			// See: https://github.com/ckeditor/ckeditor5-vue/issues/47.
			it( 'should set the initial data', async () => {
				const editor = vi.spyOn( MockEditor, 'create' );

				const component = mountComponent( {
					modelValue: 'foo'
				} );

				await timeout( 0 );

				expect( editor ).toHaveBeenCalledOnce();
				expect( editor ).toHaveBeenCalledWith( expect.any( HTMLElement ), {
					initialData: 'foo'
				} );

				component.unmount();
			} );

			it( 'should set the initial data using roots.main.initialData on CKEditor 48+', async () => {
				vi.stubGlobal( 'CKEDITOR_VERSION', '48.0.0' );
				const editor = vi.spyOn( MockEditor, 'create' );

				const component = mountComponent( {
					modelValue: 'foo'
				} );

				await timeout( 0 );

				expect( editor ).toHaveBeenCalledOnce();
				expect( editor ).toHaveBeenCalledWith(
					expect.objectContaining( {
						attachTo: expect.any( HTMLElement ),
						roots: {
							main: {
								initialData: 'foo'
							}
						}
					} )
				);

				component.unmount();
			} );

			it( 'should sync the editor data after editor is ready', async () => {
				const component = mountComponent( {
					modelValue: 'foo'
				} );

				component.setProps( { modelValue: 'bar' } );

				await timeout( 0 );

				expect( component.vm.instance!.data.get() ).to.equal( 'bar' );

				component.unmount();
			} );
		} );

		describe( '#tagName', () => {
			it( 'should be defined', async () => {
				const component = mountComponent();

				await timeout( 0 );

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

		describe( '#editorElement (rendered element definition)', () => {
			describe( 'using tagName only (no element in config)', () => {
				it( 'should render a "div" element by default', () => {
					const component = mountComponent();

					expect( component.vm.$el.tagName ).to.equal( 'DIV' );

					component.unmount();
				} );

				it( 'should render the element specified by tagName prop', () => {
					const component = mountComponent( {
						tagName: 'section'
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should ignore config.root.element for ClassicEditor and use tagName instead', () => {
					vi.spyOn( MockEditor, 'editorName', 'get' ).mockReturnValue( 'ClassicEditor' );

					const component = mountComponent( {
						tagName: 'section',
						config: {
							root: { element: 'article' }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should ignore config.roots.main.element for ClassicEditor and use tagName instead', () => {
					vi.spyOn( MockEditor, 'editorName', 'get' ).mockReturnValue( 'ClassicEditor' );

					const component = mountComponent( {
						tagName: 'textarea',
						config: {
							roots: { main: { element: 'article' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'TEXTAREA' );

					component.unmount();
				} );
			} );

			describe( 'using config.root.element or config.roots.main.element (non-ClassicEditor)', () => {
				beforeEach( () => {
					vi.spyOn( MockEditor, 'editorName', 'get' ).mockReturnValue( 'DecoupledEditor' );
				} );

				it( 'should fall back to tagName when editorName is set but neither config.root.element ' +
						'nor config.roots.main.element is provided', () => {
					const component = mountComponent( {
						tagName: 'section',
						config: {
							foo: 'bar'
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should fall back to default "div" tagName when editorName is set but config has no element definition', () => {
					const component = mountComponent();

					expect( component.vm.$el.tagName ).to.equal( 'DIV' );

					component.unmount();
				} );

				it( 'should render the element specified by config.root.element as a string', () => {
					const component = mountComponent( {
						config: {
							root: { element: 'article' }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'ARTICLE' );

					component.unmount();
				} );

				it( 'should render the element specified by config.roots.main.element as a string', () => {
					const component = mountComponent( {
						config: {
							roots: { main: { element: 'section' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should render the element specified by config.root.element as an object with name', () => {
					const component = mountComponent( {
						config: {
							root: { element: { name: 'main' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'MAIN' );

					component.unmount();
				} );

				it( 'should render the element specified by config.roots.main.element as an object with name', () => {
					const component = mountComponent( {
						config: {
							roots: { main: { element: { name: 'main' } } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'MAIN' );

					component.unmount();
				} );

				it( 'should prefer config.roots.main.element over config.root.element when both are set', () => {
					const component = mountComponent( {
						config: {
							root: { element: 'section' },
							roots: { main: { element: 'article' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'ARTICLE' );

					component.unmount();
				} );

				it( 'should apply classes from config.root.element object definition', () => {
					const component = mountComponent( {
						config: {
							root: {
								element: {
									name: 'div',
									classes: [ 'my-editor', 'custom-class' ]
								}
							}
						}
					} );

					expect( component.vm.$el.classList.contains( 'my-editor' ) ).to.be.true;
					expect( component.vm.$el.classList.contains( 'custom-class' ) ).to.be.true;

					component.unmount();
				} );

				it( 'should apply inline styles from config.root.element object definition', () => {
					const component = mountComponent( {
						config: {
							root: {
								element: {
									name: 'div',
									styles: { color: 'red', 'font-size': '16px' }
								}
							}
						}
					} );

					expect( component.vm.$el.style.color ).to.equal( 'red' );
					expect( component.vm.$el.style.fontSize ).to.equal( '16px' );

					component.unmount();
				} );

				it( 'should apply additional DOM attributes from config.root.element object definition', () => {
					const component = mountComponent( {
						config: {
							root: {
								element: {
									name: 'div',
									attributes: {
										'data-testid': 'editor-container',
										role: 'textbox'
									}
								}
							}
						}
					} );

					expect( component.vm.$el.getAttribute( 'data-testid' ) ).to.equal( 'editor-container' );
					expect( component.vm.$el.getAttribute( 'role' ) ).to.equal( 'textbox' );

					component.unmount();
				} );
			} );

			describe( 'when both tagName and config element definition are provided', () => {
				beforeEach( () => {
					vi.spyOn( MockEditor, 'editorName', 'get' ).mockReturnValue( 'DecoupledEditor' );
				} );

				it( 'should use config.root.element string over tagName', () => {
					const component = mountComponent( {
						tagName: 'textarea',
						config: {
							root: { element: 'section' }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should use config.roots.main.element string over tagName', () => {
					const component = mountComponent( {
						tagName: 'textarea',
						config: {
							roots: { main: { element: 'section' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'SECTION' );

					component.unmount();
				} );

				it( 'should use config.root.element object name over tagName', () => {
					const component = mountComponent( {
						tagName: 'textarea',
						config: {
							root: { element: { name: 'article' } }
						}
					} );

					expect( component.vm.$el.tagName ).to.equal( 'ARTICLE' );

					component.unmount();
				} );
			} );
		} );

		describe( 'isReadOnly', () => {
			it( 'should be empty when editor is not set to read only mode', async () => {
				const component = mountComponent();

				await timeout( 0 );

				expect( component.vm.instance!.isReadOnly ).toBeFalsy();

				component.unmount();
			} );

			it( 'should contain one lock when editor is set to read only mode', async () => {
				const component = mountComponent( {
					disabled: true
				} );

				await timeout( 0 );

				expect( component.vm.instance!.isReadOnly ).toBeTruthy();

				component.unmount();
			} );
		} );

		describe( '#config', () => {
			it( 'should be empty', async () => {
				const component = mountComponent();

				await timeout( 0 );

				expect( component.vm.config ).to.deep.equal( {} );

				component.unmount();
			} );

			it( 'should be set according to the initial editor#config', async () => {
				const component = mountComponent( {
					config: { foo: 'bar' }
				} );

				await timeout( 0 );

				expect( component.vm.instance!.config.get( 'foo' ) ).to.be.equal( 'bar' );

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

				await timeout( 0 );

				expect( stub ).toHaveBeenCalledTimes( 3 );
				expect( stub ).toHaveBeenNthCalledWith( 1, expect.any( HTMLElement ), {
					foo: 'bar',
					initialData: 'foo'
				} );

				expect( stub ).toHaveBeenNthCalledWith( 2, expect.any( HTMLElement ), {
					foo: 'bar',
					initialData: 'bar'
				} );

				expect( stub ).toHaveBeenNthCalledWith( 3, expect.any( HTMLElement ), {
					foo: 'bar',
					initialData: 'baz'
				} );

				component.unmount();
			} );

			it( 'should not be mutated on CKEditor 48+ when initial data is normalized to roots.main', async () => {
				vi.stubGlobal( 'CKEDITOR_VERSION', '48.0.0' );
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

				await timeout( 0 );

				expect( stub ).toHaveBeenCalledTimes( 3 );
				expect( stub ).toHaveBeenNthCalledWith(
					1,
					expect.objectContaining( {
						attachTo: expect.any( HTMLElement ),
						foo: 'bar',
						roots: {
							main: {
								initialData: 'foo'
							}
						}
					} )
				);

				expect( stub ).toHaveBeenNthCalledWith(
					2,
					expect.objectContaining( {
						attachTo: expect.any( HTMLElement ),
						foo: 'bar',
						roots: {
							main: {
								initialData: 'bar'
							}
						}
					} )
				);

				expect( stub ).toHaveBeenNthCalledWith(
					3,
					expect.objectContaining( {
						attachTo: expect.any( HTMLElement ),
						foo: 'bar',
						roots: {
							main: {
								initialData: 'baz'
							}
						}
					} )
				);

				component.unmount();
			} );

			describe( 'license v2', () => {
				it( 'should add usage data extra plugin if it\'s commercial', async () => {
					vi.stubGlobal( 'CKEDITOR_VERSION', '43.0.0' );

					const component = mountComponent( {
						config: {
							foo: 'bar',
							licenseKey: '<YOUR_LICENSE_KEY>'
						}
					} );

					await timeout( 0 );

					expect( component.vm.instance!.config.get( 'extraPlugins' ) ).to.include( VueIntegrationUsageDataPlugin );

					component.unmount();
				} );

				it( 'should not add usage data extra plugin if it\'s free', async () => {
					vi.stubGlobal( 'CKEDITOR_VERSION', '43.0.0' );

					const component = mountComponent( {
						config: {
							foo: 'bar'
						}
					} );

					await timeout( 0 );

					expect( component.vm.instance!.config.get( 'extraPlugins' ) ).not.to.include( VueIntegrationUsageDataPlugin );

					component.unmount();
				} );
			} );

			describe( 'license v3', () => {
				it( 'should add usage data extra plugin if it\'s commercial license', async () => {
					vi.stubGlobal( 'CKEDITOR_VERSION', '44.0.0' );

					const component = mountComponent( {
						config: {
							foo: 'bar',
							licenseKey: '<YOUR_LICENSE_KEY>'
						}
					} );

					await timeout( 0 );

					expect( component.vm.instance!.config.get( 'extraPlugins' ) ).to.include( VueIntegrationUsageDataPlugin );

					component.unmount();
				} );

				it( 'should not add usage data extra plugin if it\'s free license v3', async () => {
					vi.stubGlobal( 'CKEDITOR_VERSION', '44.0.0' );

					const component = mountComponent( {
						config: {
							foo: 'bar',
							licenseKey: 'GPL'
						}
					} );

					await timeout( 0 );

					expect( component.vm.instance!.config.get( 'extraPlugins' ) ).not.to.include( VueIntegrationUsageDataPlugin );

					component.unmount();
				} );
			} );
		} );

		describe( '#disableTwoWayDataBinding', () => {
			it( 'should set disableTwoWayDataBinding to false by default', async () => {
				const component = mountComponent();

				await timeout( 0 );

				expect( component.vm.disableTwoWayDataBinding ).to.equal( false );

				component.unmount();
			} );

			it( 'should not update #modelValue when disableTwoWayDataBinding is true', async () => {
				const on = vi.spyOn( ModelDocument.prototype, 'on' );
				const component = mountComponent( { disableTwoWayDataBinding: true } );

				await timeout( 0 );

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

			await timeout( 0 );

			expect( component.vm.instance ).to.be.instanceOf( MockEditor );

			component.unmount();
		} );
	} );

	describe( 'bindings', () => {
		it( '#disabled should control read only mode of the editor', async () => {
			const component = mountComponent( {
				disabled: true
			} );

			await timeout( 0 );

			expect( component.vm.instance!.isReadOnly ).toBeTruthy();

			component.setProps( { disabled: false } );

			await timeout( 0 );

			expect( component.vm.instance!.isReadOnly ).toBeFalsy();

			component.setProps( { disabled: true } );

			await timeout( 0 );

			expect( component.vm.instance!.isReadOnly ).toBeTruthy();

			component.unmount();
		} );

		it( '#modelValue should trigger editor#data.set', async () => {
			const component = mountComponent();

			await timeout( 0 );

			const spy = vi.spyOn( component.vm.instance!.data, 'set' );
			component.setProps( { modelValue: 'foo' } );

			await timeout( 0 );

			component.setProps( { modelValue: 'bar' } );

			await timeout( 0 );

			expect( spy ).toHaveBeenCalledTimes( 2 );

			// Simulate typing: The #modelValue changes but at the same time, the instance update
			// its own data so instance.data.get() and #modelValue are immediately the same.
			// Make sure instance.data.set() is not called in this situation because it would destroy
			// the selection.
			component.vm.lastEditorData = 'barq';
			component.setProps( { modelValue: 'barq' } );

			await timeout( 0 );

			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenNthCalledWith( 1, 'foo' );
			expect( spy ).toHaveBeenNthCalledWith( 2, 'bar' );

			component.unmount();
		} );

		it( '#modelValue should trigger editor#data.set only if data is changed', async () => {
			const component = mountComponent();

			await timeout( 0 );

			const spy = vi.spyOn( component.vm.instance!.data, 'set' );

			component.setProps( { modelValue: 'foo' } );

			await timeout( 0 );

			component.setProps( { modelValue: 'foo' } );

			await timeout( 0 );

			component.setProps( { modelValue: 'foo' } );

			await timeout( 0 );

			expect( spy ).toHaveBeenCalledOnce();

			component.unmount();
		} );
	} );

	describe( 'events', () => {
		describe( '#ready event', () => {
			it( 'should emit #ready when the editor is created', async () => {
				const component = mountComponent();

				await timeout( 0 );

				expect( component.emitted().ready.length ).to.equal( 1 );
				expect( component.emitted().ready[ 0 ] ).to.deep.equal( [ component.vm.instance ] );

				component.unmount();
			} );

			it( 'should emit #ready with already disabled editor when `disabled` prop is present', async () => {
				let isReadOnlyOnReady: boolean | undefined;

				const component = mountComponent( {
					disabled: true,
					onReady: ( editor: any ) => {
						isReadOnlyOnReady = editor.isReadOnly;
					}
				} );

				await timeout( 0 );

				expect( component.emitted().ready.length ).to.equal( 1 );
				expect( component.emitted().ready[ 0 ] ).to.deep.equal( [ component.vm.instance ] );
				expect( isReadOnlyOnReady ).to.be.true;

				component.unmount();
			} );
		} );

		it( 'should emit #destroy when the editor is destroyed', async () => {
			const component = mountComponent();

			await timeout( 0 );

			component.unmount();

			expect( component.emitted().destroy.length ).to.equal( 1 );
		} );

		describe( '#input event', () => {
			it( 'should be emitted but debounced when editor data changes', async () => {
				const on = vi.spyOn( ModelDocument.prototype, 'on' );
				const component = mountComponent();

				await timeout( 0 );

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

				await timeout( 0 );

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

			await timeout( 0 );

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

		it( 'should emit #blur when the editor editable is blurred', async () => {
			const on = vi.spyOn( ViewDocument.prototype, 'on' );
			const component = mountComponent();

			await timeout( 0 );

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

		describe( '#error', () => {
			it( 'should emit #error when editor element ref is not available after mount', async () => {
				const component = mount( Ckeditor, {
					props: {
						editor: MockEditor as any
					},
					global: {
						stubs: {
							DynamicElement: {
								template: '<div></div>'
							}
						}
					}
				} );

				await timeout( 0 );

				expect( component.emitted().error ).toBeDefined();
				expect( component.emitted().error.length ).to.equal( 1 );
				expect( component.emitted().error[ 0 ]![ 0 ] ).to.be.instanceOf( Error );
				expect( component.emitted().error[ 0 ]![ 0 ].message ).to.include( 'Editor element is not available' );
				expect( component.emitted().error[ 0 ]![ 1 ] ).to.deep.equal( { phase: 'initialization' } );

				component.unmount();
			} );

			it( 'should print error to console when editor element ref is not available and no error listener is provided', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();

				const component = mount( Ckeditor, {
					props: {
						editor: MockEditor as any
					},
					global: {
						stubs: {
							DynamicElement: {
								template: '<div></div>'
							}
						}
					}
				} );

				await timeout( 0 );

				expect( consoleError ).toHaveBeenCalledOnce();
				expect( consoleError.mock.calls[ 0 ][ 0 ] ).to.be.instanceOf( Error );
				expect( consoleError.mock.calls[ 0 ][ 0 ].message ).to.include( 'Editor element is not available' );

				component.unmount();
			} );

			it( 'should emit #error when editor fails to initialize', async () => {
				const error = new Error( 'test' );
				const component = mountComponent( {
					config: {
						extraPlugins: [
							function CrashPlugin() {
								throw error;
							}
						]
					}
				} );

				await timeout( 0 );

				expect( component.emitted().error.length ).to.equal( 1 );
				expect( component.emitted().error[ 0 ] ).to.deep.equal( [ error, {
					phase: 'initialization'
				} ] );

				component.unmount();
			} );

			it( 'should print error logs when error happens and no listener is provided', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();
				const component = mountComponent( {
					config: {
						extraPlugins: [
							function CrashPlugin() {
								throw new Error( 'test' );
							}
						]
					}
				} );

				await timeout( 0 );

				component.unmount();
				expect( consoleError ).toHaveBeenCalledOnce();
			} );

			it( 'should not print error logs when error happens and onError listener is provided', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();
				const component = mountComponent( {
					onError: () => {},
					config: {
						extraPlugins: [
							function CrashPlugin() {
								throw new Error( 'test' );
							}
						]
					}
				} );

				await timeout( 0 );

				component.unmount();
				expect( consoleError ).not.toHaveBeenCalled();
			} );

			it( 'should not report any errors when error is thrown after unmounting component', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();
				const error = new Error( 'test' );

				vi.spyOn( MockEditor, 'create' ).mockImplementation( () => {
					return new Promise( ( _, reject ) => {
						setTimeout( () => {
							reject( error );
						}, 100 );
					} );
				} );

				const component = mountComponent();

				await timeout( 0 );

				component.unmount();

				await timeout( 150 );

				expect( component.emitted().error ).to.be.undefined;
				expect( consoleError ).not.toHaveBeenCalled();
			} );
		} );
	} );

	// The classic editor hides the source element and inserts its UI right after it. That UI is a DOM node Vue
	// did not render, so it has to be handled when the component is replaced, moved or removed. These tests use
	// a real editor, because only a real one inserts such a node.
	describe( 'remounting and <KeepAlive>', () => {
		let container: HTMLElement;
		let editors: Array<ClassicEditor>;
		let errorHandler: Mock<( error: unknown ) => void>;

		beforeEach( () => {
			vi.stubGlobal( 'CKEDITOR_VERSION', '49.0.0' );

			container = document.createElement( 'div' );
			document.body.append( container );

			editors = [];
			errorHandler = vi.fn<( error: unknown ) => void>();
		} );

		afterEach( () => {
			container.remove();
		} );

		const editorVNode = ( props: Record<string, any> = {} ) => h( Ckeditor as any, {
			editor: RealClassicEditor,
			onReady: ( editor: ClassicEditor ) => editors.push( editor ),
			...props
		} );

		// Errors thrown while Vue patches the DOM do not reject anything the test could await, so they are
		// collected by the app error handler instead.
		function mountHost( render: () => VNode ) {
			return mount( { render }, {
				attachTo: container,
				global: {
					config: { errorHandler }
				}
			} );
		}

		// What the host element contains, in order, e.g. [ 'p', 'source', 'ck-editor', 'p' ].
		function describeChildren( element: Element = container.querySelector( 'section' )! ) {
			return Array.from( element.children ).map( child => {
				if ( child.classList.contains( 'ck-editor' ) ) {
					return 'ck-editor';
				}

				return child instanceof HTMLElement && child.style.display === 'none' ? 'source' : child.localName;
			} );
		}

		const editorsInDocument = () => document.querySelectorAll( '.ck-editor' ).length;

		// Vue renders no text nodes directly in the host element, so any that is there was left by the editor.
		const strayTextNodes = () => Array.from( container.querySelector( 'section' )!.childNodes )
			.filter( node => node.nodeType === Node.TEXT_NODE ).length;

		describe( 'replacing the component (:key)', () => {
			// The editor is the root of its parent, so Vue looks for the node after the editor to insert the
			// new one before it.
			it( 'should replace the editor and leave the DOM in order', async () => {
				const key = ref( 0 );
				const Root = { render: () => editorVNode( { key: key.value } ) };

				mountHost( () => h( 'section', [ h( 'p', 'before' ), h( Root ), h( 'p', 'after' ) ] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				key.value++;

				await vi.waitFor( () => expect( editors ).to.have.length( 2 ) );
				await vi.waitFor( () => expect( editors[ 0 ].state ).to.equal( 'destroyed' ) );

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( editors[ 1 ].state ).to.equal( 'ready' );
				expect( editorsInDocument() ).to.equal( 1 );
				expect( describeChildren() ).to.deep.equal( [ 'p', 'source', 'ck-editor', 'p' ] );
				expect( strayTextNodes() ).to.be.at.most( 1 );
			} );

			it( 'should replace the editor when it is not the root of its parent', async () => {
				const key = ref( 0 );

				mountHost( () => h( 'section', [ h( 'p', 'before' ), editorVNode( { key: key.value } ), h( 'p', 'after' ) ] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				key.value++;

				await vi.waitFor( () => expect( editors ).to.have.length( 2 ) );
				await vi.waitFor( () => expect( editors[ 0 ].state ).to.equal( 'destroyed' ) );

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( editorsInDocument() ).to.equal( 1 );
				expect( describeChildren() ).to.deep.equal( [ 'p', 'source', 'ck-editor', 'p' ] );
			} );

			it( 'should replace the editor while the previous one is still being created', async () => {
				const key = ref( 0 );
				const Root = { render: () => editorVNode( { key: key.value } ) };

				mountHost( () => h( 'section', [ h( Root ), h( 'p', 'after' ) ] ) );

				// Replaced before the first editor is ready, so that one has to be dropped, not kept.
				key.value++;

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );
				await timeout( 100 );

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( editors ).to.have.length( 1 );
				expect( editorsInDocument() ).to.equal( 1 );
				expect( describeChildren() ).to.deep.equal( [ 'source', 'ck-editor', 'p' ] );
			} );
		} );

		describe( 'removing the component', () => {
			it( 'should remove the editor UI and emit #destroy', async () => {
				const mounted = ref( true );
				const onDestroy = vi.fn();

				mountHost( () => h( 'section', [ mounted.value ? editorVNode( { onDestroy } ) : null, h( 'p', 'after' ) ] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				mounted.value = false;

				await vi.waitFor( () => expect( editors[ 0 ].state ).to.equal( 'destroyed' ) );

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( onDestroy ).toHaveBeenCalledOnce();
				expect( editorsInDocument() ).to.equal( 0 );
				expect( describeChildren() ).to.deep.equal( [ 'p' ] );
				expect( strayTextNodes() ).to.equal( 0 );
			} );

			it( 'should emit #destroy when the whole app is unmounted', async () => {
				const onDestroy = vi.fn();
				const host = mountHost( () => h( 'section', [ editorVNode( { onDestroy } ) ] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				host.unmount();

				await vi.waitFor( () => expect( editors[ 0 ].state ).to.equal( 'destroyed' ) );

				expect( onDestroy ).toHaveBeenCalledOnce();
				expect( editorsInDocument() ).to.equal( 0 );
			} );
		} );

		describe( '<KeepAlive>', () => {
			it( 'should take the editor UI along when deactivated and bring it back when activated', async () => {
				const active = ref( true );

				mountHost( () => h( 'section', [
					h( KeepAlive, null, [ active.value ? editorVNode() : h( 'p', { class: 'placeholder' } ) ] ),
					h( 'p', 'after' )
				] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				const [ editor ] = editors;

				active.value = false;
				await nextTick();

				// Nothing of the editor stays on the page next to the placeholder.
				expect( editorsInDocument() ).to.equal( 0 );
				expect( describeChildren() ).to.deep.equal( [ 'p', 'p' ] );

				active.value = true;
				await nextTick();

				// The very same editor is back, in the right place.
				expect( errorHandler ).not.toHaveBeenCalled();
				expect( editors ).to.have.length( 1 );
				expect( editor.state ).to.equal( 'ready' );
				expect( editorsInDocument() ).to.equal( 1 );
				expect( container.querySelector( '.ck-editor' ) ).to.equal( editor.ui.element );
				expect( describeChildren() ).to.deep.equal( [ 'source', 'ck-editor', 'p' ] );
			} );

			it( 'should keep working after being deactivated and activated several times', async () => {
				const active = ref( true );

				mountHost( () => h( 'section', [
					h( KeepAlive, null, [ active.value ? editorVNode() : h( 'p', { class: 'placeholder' } ) ] )
				] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				for ( let i = 0; i < 3; i++ ) {
					active.value = false;
					await nextTick();

					expect( editorsInDocument() ).to.equal( 0 );

					active.value = true;
					await nextTick();

					expect( editorsInDocument() ).to.equal( 1 );
					expect( describeChildren() ).to.deep.equal( [ 'source', 'ck-editor' ] );
				}

				expect( editors ).to.have.length( 1 );
			} );

			it( 'should destroy the editor and leave nothing behind when removed while deactivated', async () => {
				const mounted = ref( true );
				const active = ref( true );
				const onDestroy = vi.fn();

				mountHost( () => h( 'section', [
					mounted.value ? h( KeepAlive, null, [
						active.value ? editorVNode( { onDestroy } ) : h( 'p', { class: 'placeholder' } )
					] ) : null,
					h( 'p', 'after' )
				] ) );

				await vi.waitFor( () => expect( editors ).to.have.length( 1 ) );

				active.value = false;
				await nextTick();

				mounted.value = false;

				await vi.waitFor( () => expect( editors[ 0 ].state ).to.equal( 'destroyed' ) );

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( onDestroy ).toHaveBeenCalledOnce();
				expect( editorsInDocument() ).to.equal( 0 );
				expect( describeChildren() ).to.deep.equal( [ 'p' ] );
				expect( strayTextNodes() ).to.equal( 0 );
			} );

			// Only a UI that the editor placed right after the source element is Vue's to keep together with it.
			it( 'should not move an editor UI that is rendered elsewhere', async () => {
				const active = ref( true );
				const externalUI = document.createElement( 'div' );

				document.body.append( externalUI );

				class ExternalUIEditor extends MockEditor {
					public readonly ui = { element: externalUI };
				}

				mountHost( () => h( 'section', [
					h( KeepAlive, null, [ active.value ? editorVNode( { editor: ExternalUIEditor } ) : h( 'p' ) ] )
				] ) );

				await vi.waitFor( () => expect( container.querySelector( 'section > div' ) ).to.not.be.null );

				active.value = false;
				await nextTick();
				active.value = true;
				await nextTick();

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( externalUI.parentElement ).to.equal( document.body );

				externalUI.remove();
			} );

			// `InlineEditor`, `BalloonEditor` and `DecoupledEditor` turn the source element itself into the UI.
			it( 'should not touch an editor whose UI is the source element', async () => {
				const active = ref( true );

				class SourceUIEditor extends MockEditor {
					public readonly ui = { element: this.element };
				}

				mountHost( () => h( 'section', [
					h( KeepAlive, null, [ active.value ? editorVNode( { editor: SourceUIEditor } ) : h( 'p' ) ] ),
					h( 'p', 'after' )
				] ) );

				await vi.waitFor( () => expect( container.querySelector( 'section > div' ) ).to.not.be.null );

				active.value = false;
				await nextTick();
				active.value = true;
				await nextTick();

				expect( errorHandler ).not.toHaveBeenCalled();
				expect( describeChildren() ).to.deep.equal( [ 'div', 'p' ] );
			} );
		} );
	} );

	describe( 'error reporting', () => {
		beforeEach( () => {
			// These mount real editors, so they should run on a version the integration supports.
			vi.stubGlobal( 'CKEDITOR_VERSION', '49.0.0' );
		} );

		// A real editor, unlike the mock used elsewhere in this file: reporting finds the editor an error
		// belongs to among the editors that are actually running, and a mock is not one of them.
		function mountReal( props: Record<string, any> = {} ) {
			return mount( Ckeditor, {
				props: {
					editor: RealClassicEditor as any,
					...props
				},

				// A real editor needs its element in the document.
				attachTo: document.body
			} );
		}

		async function waitForReal( component: any ): Promise<ClassicEditor> {
			await vi.waitFor( () => {
				expect( component.vm.instance ).to.be.instanceOf( RealClassicEditor );
			} );

			return component.vm.instance as ClassicEditor;
		}

		it( 'should emit an error that escaped a running editor, and keep the editor', async () => {
			const component = mountReal( { onError: () => {} } );
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
		// what keeps an error with the component whose editor it came from.
		it( 'should not emit an error that came from another editor', async () => {
			const component = mountReal( { onError: () => {} } );
			const other = mountReal( { onError: () => {} } );

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

		it( 'should stop emitting once the component is unmounted', async () => {
			const component = mountReal( { onError: () => {} } );
			const editor = await waitForReal( component );

			component.unmount();

			await turnOffErrors( () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
				} );
			} );

			expect( component.emitted().error ).to.be.undefined;
		} );

		// The guard inside the callback and the unsubscribe hide each other: with either one alone the
		// component still looks silent after unmounting. Only the unsubscribe stops the page-level
		// listeners from being retained, so it is asserted on its own.
		it( 'should unregister the reporting when the component is unmounted', async () => {
			const off = vi.fn();
			const register = vi.spyOn( RealClassicEditor, 'onEditorError' ).mockReturnValue( off );
			const component = mountReal( { onError: () => {} } );

			await waitForReal( component );

			expect( register ).toHaveBeenCalledOnce();
			expect( off ).not.toHaveBeenCalled();

			component.unmount();

			expect( off ).toHaveBeenCalledOnce();
		} );

		// An older editor class has no reporting static. Creating the editor must still succeed — a missing
		// static is not a failure to create one — and the integrator has to be told what stops working.
		it( 'should create the editor and warn when the class predates the reporting API', async () => {
			class LegacyEditor extends MockEditor {}

			Object.defineProperty( LegacyEditor, 'onEditorError', { value: undefined } );

			const consoleWarn = vi.spyOn( console, 'warn' ).mockReturnValue();
			const component = mountComponent( { editor: LegacyEditor } );

			await timeout( 0 );

			expect( component.emitted().error ).to.be.undefined;
			expect( component.emitted().ready ).to.have.length( 1 );
			expect( consoleWarn ).toHaveBeenCalledWith( REPORTING_UNAVAILABLE_WARNING );

			component.unmount();
		} );

		it( 'should print the error to the console when no listener is attached', async () => {
			const consoleError = vi.spyOn( console, 'error' ).mockReturnValue();
			const component = mountReal();
			const editor = await waitForReal( component );
			const error = new CKEditorError( 'a-custom-error', editor );

			await turnOffErrors( () => {
				setTimeout( () => {
					throw error;
				} );
			} );

			await vi.waitFor( () => {
				expect( consoleError ).toHaveBeenCalledWith( error );
			} );

			component.unmount();
		} );

		it( 'should properly forward `editorName` of the editor', async () => {
			vi.stubGlobal( 'CKEDITOR_VERSION', '48.2.0' );

			let passedConfig!: EditorRelaxedConfig;

			class NamedEditor extends MockEditor {
				public static get editorName(): string {
					return 'InlineEditor';
				}

				public static override create( config: EditorRelaxedConfig ): Promise<NamedEditor> {
					passedConfig = config;
					return super.create( config ) as Promise<NamedEditor>;
				}
			}

			const component = mountComponent( { editor: NamedEditor } );

			await vi.waitFor( () => {
				const firstInstance = component.vm.instance;

				expect( ( firstInstance?.constructor as typeof NamedEditor ).editorName ).to.equal( 'InlineEditor' );
				expect( passedConfig.roots?.main?.element ).to.be.instanceOf( HTMLDivElement );
			} );
		} );
	} );
} );

function mountComponent( props: Record<string, any> = {} ) {
	return mount( Ckeditor, {
		props: {
			editor: MockEditor as any,
			...props
		}
	} );
}

function timeout( delay: number ) {
	return new Promise( resolve => setTimeout( resolve, delay ) );
}
