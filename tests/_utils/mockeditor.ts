/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConfig } from '@ckeditor/ckeditor5-integrations-common';

/**
 * A simple event system for mock purposes.
 * Allows registering (on, once) and triggering (fire) events.
 */
class SimpleEmitter {
	private _listeners: Record<string, Array<Function>> = {};

	public on( event: string, callback: Function ): void {
		if ( !this._listeners[ event ] ) {
			this._listeners[ event ] = [];
		}
		this._listeners[ event ].push( callback );
	}

	public once( event: string, callback: Function ): void {
		const wrapper = ( ...args: Array<any> ) => {
			callback( ...args );
			this.off( event, wrapper );
		};
		this.on( event, wrapper );
	}

	public off( event: string, callback: Function ): void {
		if ( !this._listeners[ event ] ) {
			return;
		}

		this._listeners[ event ] = this._listeners[ event ].filter( cb => cb !== callback );
	}

	public fire( event: string, ...args: Array<any> ): void {
		if ( !this._listeners[ event ] ) {
			return;
		}

		// Copy the array to avoid errors if a callback removes itself during execution (e.g., with `once`)
		[ ...this._listeners[ event ] ].forEach( cb => cb( ...args ) );
	}
}

export class ModelDocument extends SimpleEmitter {}

export class ViewDocument extends SimpleEmitter {}

export class MockEditor extends SimpleEmitter {
	public declare element?: HTMLElement;
	public declare config?: EditorRelaxedConfig;
	public declare _data: any;
	public declare setDataCounter: number;
	public declare model: { document: ModelDocument };
	public declare editing: { view: { document: ViewDocument } };
	public declare data: { get: () => any; set: ( data: any ) => void };
	public declare _readOnlyLocks: Set<any>;

	constructor( elOrConfig?: EditorRelaxedConfig | HTMLElement, config?: EditorRelaxedConfig ) {
		super();
		this.element = elOrConfig instanceof HTMLElement ? elOrConfig : elOrConfig?.attachTo;
		this.config = config ?? ( elOrConfig as EditorRelaxedConfig );
		this._data = '';
		this.setDataCounter = 0;

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewDocument()
			}
		};

		this.data = {
			get: () => {
				return this._data;
			},

			set: ( data: any ) => {
				this.setDataCounter += 1;
				this._data = data;
				// Optional: we can emit a data change event here, which is often useful in tests
				this.model.document.fire( 'change:data' );
			}
		};

		this._readOnlyLocks = new Set();
	}

	public static async create( ...args: Array<any> ): Promise<MockEditor> {
		// Cast to any to dynamically pass arguments to the constructor
		const editor = new ( this as any )( ...args );

		// Retrieve plugins from the configuration (checking both common paths)
		const plugins = editor.config?.plugins || editor.config?.extraPlugins || [];

		// 1. Plugin initialization
		for ( const Plugin of plugins ) {
			try {
				// Check if it's a class (CKEditor standard) or a regular function (like your Vue wrapper)
				if ( Plugin.prototype && Plugin.prototype.constructor ) {
					const instance = new Plugin( editor );
					if ( typeof instance.init === 'function' ) {
						await instance.init();
					}
				} else {
					// eslint-disable-next-line new-cap
					Plugin( editor );
				}
			} catch ( e ) {
				console.warn( 'MockEditor: Error during plugin initialization', e );
			}
		}

		// Simulate the asynchronous editor lifecycle
		await Promise.resolve();

		// 2. Emit the 'ready' event that your Vue plugin is waiting for
		editor.fire( 'ready' );

		return editor;
	}

	public destroy(): Promise<void> {
		// Emit 'destroy', which allows testing e.g., debounce cleanup
		this.fire( 'destroy' );
		return Promise.resolve();
	}

	public get isReadOnly(): boolean {
		return this._readOnlyLocks.size > 0;
	}

	public enableReadOnlyMode( key: string ): void {
		this._readOnlyLocks.add( key );
	}

	public disableReadOnlyMode( key: string ): void {
		this._readOnlyLocks.delete( key );
	}
}
