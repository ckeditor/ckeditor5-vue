/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Minimal event emitter used by mock classes.
 * Supports registering (on, once) and triggering (fire) named events.
 */
export class SimpleEmitter {
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
