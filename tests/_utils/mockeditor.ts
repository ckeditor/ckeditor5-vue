/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConfig } from '@ckeditor/ckeditor5-integrations-common';

type EditorConfig = EditorRelaxedConfig & Record<string, unknown>;

/**
 * Wraps the raw editor config object and exposes a `get(path)` method
 * that supports dot-separated paths, e.g. `config.get('toolbar.items')`.
 */
class EditorConfigAccessor {
	private _config: EditorConfig;

	constructor( config: EditorConfig = {} ) {
		this._config = config;
	}

	public get<T = unknown>( path: string ): T | undefined {
		return path.split( '.' ).reduce<any>( ( node, key ) => node?.[ key ], this._config );
	}

	/** Returns the underlying raw config object. */
	public toObject(): EditorConfig {
		return this._config;
	}
}

/**
 * Minimal event emitter used by mock classes.
 * Supports registering (on, once) and triggering (fire) named events.
 */
class SimpleEmitter {
	private _listeners: Record<string, Array<Function>> = {};

	public on( event: string, callback: Function ): void {
		( this._listeners[ event ] ??= [] ).push( callback );
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

		// Copy the array to avoid issues if a listener removes itself during dispatch (e.g. via `once`)
		[ ...this._listeners[ event ] ].forEach( cb => cb( ...args ) );
	}
}

export class MockEditor extends SimpleEmitter {
	public readonly element: HTMLElement | undefined;
	public readonly config: EditorConfigAccessor;

	public model: { document: ModelDocument };
	public editing: { view: { document: ViewDocument } };
	public data: { get: () => any; set: ( data: any ) => void };

	/** Counts `data.set` calls — useful in test assertions. */
	public setDataCounter = 0;

	private _data: any = '';
	private _readOnlyLocks = new Set<string>();

	constructor(
		elOrConfig?: EditorRelaxedConfig | HTMLElement,
		config?: EditorRelaxedConfig
	) {
		super();

		this.element = elOrConfig instanceof HTMLElement ?
			elOrConfig :
			( elOrConfig as EditorRelaxedConfig )?.attachTo as HTMLElement | undefined;

		const rawConfig: EditorConfig = ( config ?? ( elOrConfig as EditorRelaxedConfig ) ?? {} ) as EditorConfig;
		this.config = new EditorConfigAccessor( rawConfig );

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewDocument()
			}
		};

		this.data = {
			get: () => this._data,
			set: ( data: any ) => {
				this.setDataCounter += 1;
				this._data = data;
				this.model.document.fire( 'change:data' );
			}
		};
	}

	public static async create( ...args: Array<any> ): Promise<MockEditor> {
		const editor = new ( this as any )( ...args ) as MockEditor;
		const rawConfig = editor.config.toObject();

		const plugins = [
			...( rawConfig.plugins ?? [] ),
			...( rawConfig.extraPlugins ?? [] )
		];

		for ( const Plugin of plugins ) {
			if ( Plugin.prototype?.constructor ) {
				// Standard CKEditor-style class plugin
				const instance = new Plugin( editor );

				if ( typeof instance.init === 'function' ) {
					await instance.init();
				}
			} else {
				// Plain function plugin (e.g. a Vue wrapper)
				// eslint-disable-next-line new-cap
				Plugin( editor );
			}
		}

		// Simulate the asynchronous editor lifecycle before firing 'ready'
		await Promise.resolve();

		editor.fire( 'ready' );

		return editor;
	}

	public destroy(): Promise<void> {
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

export class ModelDocument extends SimpleEmitter {}

export class ViewDocument extends SimpleEmitter {}
