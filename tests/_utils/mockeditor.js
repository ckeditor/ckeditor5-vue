/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export class ModelDocument {
	on() {}
}

export class ViewDocument {
	on() {}
}

export class MockEditor {
	constructor( el, config ) {
		this.element = el;
		this.config = config;
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

			set: data => {
				this.setDataCounter += 1;
				this._data = data;
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

	enableReadOnlyMode( key ) {
		this._readOnlyLocks.add( key );
	}

	disableReadOnlyMode( key ) {
		this._readOnlyLocks.delete( key );
	}
}

