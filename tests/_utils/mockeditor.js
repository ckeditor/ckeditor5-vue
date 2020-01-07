/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
		this.data = '';
		this.setDataCounter = 0;

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewDocument()
			}
		};
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
		this.data = data;
	}

	getData() {
		return this.data;
	}
}

