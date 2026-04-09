/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorRelaxedConfig } from '@ckeditor/ckeditor5-integrations-common';

export class ModelDocument {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public on( _: string, __: Function ): void {}
}

export class ViewDocument {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public on( _: string, __: Function ): void {}
}

export class MockEditor {
	public declare element?: HTMLElement;
	public declare config?: EditorRelaxedConfig;
	public declare _data: any;
	public declare setDataCounter: number;
	public declare model: any;
	public declare editing: any;
	public declare data: any;
	public declare _readOnlyLocks: Set<any>;

	constructor( elOrConfig?: EditorRelaxedConfig | HTMLElement, config?: EditorRelaxedConfig ) {
		this.element = elOrConfig instanceof HTMLElement ? elOrConfig : elOrConfig?.attachTo;
		this.config = config ?? elOrConfig;
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
			}
		};

		this._readOnlyLocks = new Set();
	}

	public static create( ...args: Array<any> ): Promise<any> {
		const editor = new this( ...args );

		return Promise.resolve( editor );
	}

	public destroy(): Promise<void> {
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

