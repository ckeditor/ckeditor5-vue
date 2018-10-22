/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export class ModelDocument {
	on() {}
};

export class ViewlDocument {
	on() {}
};

export default class MockEditor {
	constructor( el, config ) {
		this.element = el;
		this.config = config;

		this.model = {
			document: new ModelDocument()
		};

		this.editing = {
			view: {
				document: new ViewlDocument()
			}
		};
	}

	static create( el, config ) {
		const editor = new this( el, config );

		return Promise.resolve( editor );
	}

	destroy() { return Promise.resolve() }

	setData() {}
	getData() {}
}

