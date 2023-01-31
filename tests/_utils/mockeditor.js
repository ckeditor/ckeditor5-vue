/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global  setTimeout */
import { nextTick } from 'vue';

export class ModelDocument {
	on() {}
	off() {}
	getRootNames() {
		return [ 'main' ];
	}
}

export class ViewDocument {
	on() {}
}

export class MockEditor {
	constructor( el, config ) {
		this.element = el;
		this.config = config;
		this._value = '';
		this.data = {
			get() {
				return this._value;
			},
			set( value ) {
				this._value = value;
			}
		};
		this.setDataCounter = 0;

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewDocument()
			}
		};

		this._readOnlyLocks = new Set();
	}

	static create( el, config ) {
		const editor = new this( el, config );

		return Promise.resolve( editor );
	}

	destroy() {
		return Promise.resolve();
	}

	setData( data ) {
		this.setDataCounter++;
		this._value = data;
	}

	getData() {
		return this._value;
	}

	enableReadOnlyMode( key ) {
		this._readOnlyLocks.add( key );
	}

	disableReadOnlyMode( key ) {
		this._readOnlyLocks.delete( key );
	}
}

export const waitForEditorToBeReady = async () => {
	await nextTick();
	await new Promise( res => setTimeout( res, 1 ) );
};

