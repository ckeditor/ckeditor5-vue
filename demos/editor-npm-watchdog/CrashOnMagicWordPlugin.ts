/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5';

const MAGIC_WORD = 'okoń';

export class CrashOnMagicWordPlugin extends Plugin {
	public static get pluginName() {
		return 'CrashOnMagicWordPlugin' as const;
	}

	public init(): void {
		const editor = this.editor;
		let timer: ReturnType<typeof setTimeout> | null = null;

		editor.model.document.on( 'change:data', () => {
			const data = editor.getData();

			if ( !data.toLowerCase().includes( MAGIC_WORD ) ) {
				return;
			}

			if ( timer !== null ) {
				clearTimeout( timer );
			}

			timer = setTimeout( () => {
				editor.model.change( writer => {
					const root = editor.model.document.getRoot()!;
					const illegalNode = writer.createElement( 'unregisteredElement' );

					writer.insert( illegalNode, root, 0 );
				} );
			}, 200 );
		} );
	}
}
