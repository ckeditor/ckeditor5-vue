/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { MockEditor } from './mockeditor.js';
import { SimpleEmitter } from './simpleemitter.js';

/**
 * Mock implementation of CKEditor's EditorWatchdog.
 */
export class MockWatchdog extends SimpleEmitter {
	public editor: MockEditor | null = null;

	public watchdogConfig: any;

	private _creator: ( ( ...args: Array<any> ) => Promise<MockEditor> ) | null = null;
	private _EditorClass: typeof MockEditor;

	constructor( EditorClass: typeof MockEditor, _watchdogConfig?: unknown ) {
		super();
		this._EditorClass = EditorClass;
		this.watchdogConfig = _watchdogConfig;
	}

	public setCreator( creator: ( ...args: Array<any> ) => Promise<MockEditor> ): void {
		this._creator = creator;
	}

	public async create( ...args: Array<any> ): Promise<void> {
		const createFn = this._creator ?? ( ( ...a ) => this._EditorClass.create( ...a ) );
		const editor = await createFn( ...args );

		editor.once( 'destroy', () => {
			this.editor = null;
		} );

		this.editor = editor;
	}

	public destroy(): Promise<void> {
		return this.editor ? this.editor.destroy() : Promise.resolve();
	}

	/**
	 * Simulates a runtime crash detected by the watchdog.
	 * Fires 'error' in the same shape as the real watchdog: `( evt, { error, causesRestart } )`.
	 * When `causesRestart` is true, replaces the inner editor and fires 'restart'.
	 */
	public async simulateError(
		error: Error = new Error( 'Simulated watchdog error' ),
		causesRestart: boolean = false
	): Promise<void> {
		this.fire( 'error', {}, { error, causesRestart } );

		if ( causesRestart ) {
			const prevEditor = this.editor;
			const rawConfig = prevEditor?.config.toObject() ?? {};

			if ( prevEditor ) {
				await prevEditor.destroy();
			}

			await this.create( rawConfig );
			this.fire( 'restart' );
		}
	}
}
