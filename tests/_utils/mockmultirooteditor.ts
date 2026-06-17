/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConfig } from 'ckeditor5';
import { SimpleEmitter } from './simpleemitter.js';
import { MockWatchdog } from './mockwatchdog.js';

type MultiRootEditorConfig = EditorConfig & Record<string, any>;

class EditorConfigAccessor {
	private _config: MultiRootEditorConfig;

	constructor( config: MultiRootEditorConfig ) {
		this._config = config;
	}

	public get<T = unknown>( path: string ): T | undefined {
		return path.split( '.' ).reduce<any>( ( node, key ) => node?.[ key ], this._config );
	}

	public toObject(): MultiRootEditorConfig {
		return this._config;
	}
}

export class MockMultiRootEditor extends SimpleEmitter {
	public static EditorWatchdog = MockWatchdog as any;

	public static editorName = 'MultiRootEditor';

	public readonly config: EditorConfigAccessor;
	public readonly id = String( Math.random() );
	public state = 'ready';
	public isReadOnly = false;

	public model: any;
	public editing: any;
	public ui: any;
	public data: any;

	private _data: Record<string, string> = {};
	private _roots: Record<string, MockModelRootElement> = {};
	private _readOnlyLocks = new Set<string>();
	private _registeredRootAttributes = new Set<string>();

	constructor( dataOrConfig: Record<string, string> | MultiRootEditorConfig = {}, config: MultiRootEditorConfig = {} ) {
		super();

		const rawConfig = isLegacyCreateCall( dataOrConfig, config ) ? config : dataOrConfig as MultiRootEditorConfig;

		this.config = new EditorConfigAccessor( rawConfig );
		this._data = isLegacyCreateCall( dataOrConfig, config ) ?
			{ ...dataOrConfig as Record<string, string> } :
			extractDataFromConfig( rawConfig );

		const rootsAttributes = isLegacyCreateCall( dataOrConfig, config ) ?
			config.rootsAttributes ?? {} :
			extractRootsAttributesFromConfig( rawConfig );

		this.model = createModel( this );
		this.editing = createEditingView();
		this.ui = createUi( this );
		this.data = {
			get: () => this.getFullData(),
			set: ( data: Record<string, string> ) => this.setData( data )
		};

		for ( const rootName of Object.keys( this._data ) ) {
			this._addRoot( rootName, this._data[ rootName ], rootsAttributes[ rootName ] ?? {} );
		}
	}

	public static async create( ...args: Array<any> ): Promise<MockMultiRootEditor> {
		const editor = new ( this as any )( ...args ) as MockMultiRootEditor;
		const plugins: Array<any> = [
			...( editor.config.toObject().plugins ?? [] ),
			...( editor.config.toObject().extraPlugins ?? [] )
		];

		for ( const Plugin of plugins ) {
			if ( Plugin.prototype?.constructor ) {
				const instance = new Plugin( editor );

				if ( typeof instance.init === 'function' ) {
					await instance.init();
				}
			} else {
				// eslint-disable-next-line new-cap
				Plugin( editor );
			}
		}

		await Promise.resolve();
		editor.fire( 'ready' );

		return editor;
	}

	public destroy(): Promise<void> {
		this.state = 'destroyed';
		this.fire( 'destroy' );

		return Promise.resolve();
	}

	public enableReadOnlyMode( key: string ): void {
		this._readOnlyLocks.add( key );
		this.isReadOnly = true;
	}

	public disableReadOnlyMode( key: string ): void {
		this._readOnlyLocks.delete( key );
		this.isReadOnly = this._readOnlyLocks.size > 0;
	}

	public getData( { rootName }: { rootName: string } ): string {
		return this._data[ rootName ] ?? '';
	}

	public setData( data: Record<string, string> ): void {
		const changedRoots = Object.keys( data );

		for ( const rootName of changedRoots ) {
			this._data[ rootName ] = data[ rootName ];
		}

		this.model.document.differ.setChanges(
			changedRoots.map( rootName => ( {
				type: 'insert',
				position: {
					root: this.model.document.getRoot( rootName )
				}
			} ) ),
			[]
		);

		this.model.document.fire( 'change:data', {} );
		this.model.document.differ.clear();
	}

	public getFullData(): Record<string, string> {
		return { ...this._data };
	}

	public getRootAttributes( rootName: string ): Record<string, unknown> {
		return { ...this._roots[ rootName ]?.attributes };
	}

	public getRootsAttributes(): Record<string, Record<string, unknown>> {
		return Object.keys( this._roots ).reduce<Record<string, Record<string, unknown>>>( ( result, rootName ) => {
			result[ rootName ] = this.getRootAttributes( rootName );

			return result;
		}, {} );
	}

	public registerRootAttribute( key: string ): void {
		this._registeredRootAttributes.add( key );
	}

	public addRoot( rootName: string, options: Record<string, any> = {} ): void {
		const attributes = {
			...( options.attributes ?? options.modelAttributes ?? {} )
		};

		this._addRoot( rootName, options.data ?? options.initialData ?? '', attributes );
		this.fire( 'addRoot', {}, this._roots[ rootName ] );
	}

	public detachRoot( rootName: string ): void {
		const root = this._roots[ rootName ];

		if ( !root ) {
			return;
		}

		delete this._data[ rootName ];
		delete this._roots[ rootName ];
		root.detach();
		this.fire( 'detachRoot', {}, root );
	}

	public detachEditable( root: MockModelRootElement ): void {
		const editable = this.ui.view.editables[ root.rootName ];

		if ( editable ) {
			editable.element.classList.remove( 'ck-editor__editable' );
		}

		delete this.ui.view.editables[ root.rootName ];
		this.editing.view.domRoots.delete( root.rootName );
	}

	private _addRoot( rootName: string, data: string, attributes: Record<string, unknown> ): void {
		this._data[ rootName ] = data;
		this._roots[ rootName ] = new MockModelRootElement( rootName, attributes );
	}
}

export class MockModelRootElement {
	public readonly rootName: string;
	public attributes: Record<string, unknown>;

	private _isAttached = true;

	constructor( rootName: string, attributes: Record<string, unknown> ) {
		this.rootName = rootName;
		this.attributes = { ...attributes };
	}

	public getAttribute( key: string ): unknown {
		return this.attributes[ key ];
	}

	public isAttached(): boolean {
		return this._isAttached;
	}

	public detach(): void {
		this._isAttached = false;
	}
}

class MockDiffer {
	private _changes: Array<any> = [];
	private _changedRoots: Array<any> = [];

	public getChanges(): Array<any> {
		return this._changes;
	}

	public getChangedRoots(): Array<any> {
		return this._changedRoots;
	}

	public setChanges( changes: Array<any>, changedRoots: Array<any> ): void {
		this._changes = changes;
		this._changedRoots = changedRoots;
	}

	public clear(): void {
		this._changes = [];
		this._changedRoots = [];
	}
}

class MockModelDocument extends SimpleEmitter {
	public readonly differ = new MockDiffer();

	private _editor: MockMultiRootEditor;

	constructor( editor: MockMultiRootEditor ) {
		super();
		this._editor = editor;
	}

	public getRoot( rootName: string ): MockModelRootElement | null {
		return ( this._editor as any )._roots[ rootName ] ?? null;
	}
}

class MockViewDocument extends SimpleEmitter {}

function createModel( editor: MockMultiRootEditor ) {
	const document = new MockModelDocument( editor );

	return {
		document,
		schema: {
			checkChild: () => true
		},
		change: ( callback: Function ) => {
			const writer = createWriter( document );

			callback( writer );

			if ( document.differ.getChangedRoots().length ) {
				document.fire( 'change:data', {} );
				document.differ.clear();
			}
		}
	};
}

function createWriter( document: MockModelDocument ) {
	return {
		removeAttribute: ( key: string, root: MockModelRootElement ) => {
			delete root.attributes[ key ];
			document.differ.setChanges( [], [ { name: root.rootName } ] );
		},
		setAttributes: ( attributes: Record<string, unknown>, root: MockModelRootElement ) => {
			root.attributes = { ...attributes };
			document.differ.setChanges( [], [ { name: root.rootName } ] );
		}
	};
}

function createEditingView() {
	const domRoots = new Map<string, HTMLElement>();

	return {
		view: {
			document: new MockViewDocument(),
			domRoots,
			forceRender: () => {},
			getDomRoot: ( rootName: string ) => domRoots.get( rootName ),
			attachDomRoot: ( element: HTMLElement, rootName: string ) => domRoots.set( rootName, element )
		}
	};
}

function createUi( editor: MockMultiRootEditor ) {
	const toolbarElement = document.createElement( 'div' );

	toolbarElement.classList.add( 'ck-toolbar' );

	const view: {
		toolbar: { element: HTMLElement };
		editables: Record<string, any>;
		createEditable: ( name: string, element: HTMLElement, label?: string ) => Record<string, unknown>;
	} = {
		toolbar: {
			element: toolbarElement
		},
		editables: {},
		createEditable: ( name: string, element: HTMLElement, label?: string ) => ( {
			name,
			element,
			label
		} )
	};

	return {
		view,
		addEditable: ( editable: any, placeholder?: string ) => {
			editable.element.classList.add( 'ck-editor__editable' );

			if ( editable.isInlineRoot ) {
				editable.element.classList.add( 'ck-editor__editable_inline-root' );
			}

			if ( placeholder ) {
				editable.element.setAttribute( 'data-placeholder', placeholder );
				editable.element.classList.add( 'ck-placeholder' );
			}

			view.editables[ editable.name ] = editable;
			editor.editing.view.attachDomRoot( editable.element, editable.name );
		},
		getEditableElement: ( rootName: string ) => view.editables[ rootName ]?.element
	};
}

function isLegacyCreateCall( _dataOrConfig: Record<string, string> | MultiRootEditorConfig, config: MultiRootEditorConfig ): boolean {
	return !!Object.keys( config ).length;
}

function extractDataFromConfig( config: MultiRootEditorConfig ): Record<string, string> {
	if ( config.roots ) {
		const roots = config.roots;

		return Object.keys( config.roots ).reduce<Record<string, string>>( ( result, rootName ) => {
			result[ rootName ] = roots[ rootName ].initialData ?? '';

			return result;
		}, {} );
	}

	return typeof config.initialData === 'string' ? {} : config.initialData ?? {};
}

function extractRootsAttributesFromConfig( config: MultiRootEditorConfig ): Record<string, Record<string, unknown>> {
	if ( config.roots ) {
		const roots = config.roots;

		return Object.keys( roots ).reduce<Record<string, Record<string, unknown>>>( ( result, rootName ) => {
			result[ rootName ] = {
				...( roots[ rootName ].modelAttributes ?? {} )
			};

			return result;
		}, {} );
	}

	return config.rootsAttributes ?? {};
}
