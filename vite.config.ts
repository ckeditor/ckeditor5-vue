/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { resolve } from 'path';
import { createRequire } from 'module';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const require = createRequire( import.meta.url );
const pkg = require( './package.json' );

export default defineConfig( {
	plugins: [
		vue()
	],

	build: {
		minify: false,
		sourcemap: true,
		target: 'es2019',

		// https://vitejs.dev/guide/build#library-mode
		lib: {
			entry: resolve( __dirname, 'src/plugin.ts' ),
			name: 'CKEDITOR_VUE',
			fileName: 'ckeditor'
		},

		rollupOptions: {
			external: Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} ),

			output: {
				globals: {
					'vue': 'Vue',
					'lodash-es': '_'
				}
			}
		}
	},

	resolve: {
		alias: [
			{ find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' }
		]
	},

	// https://vitest.dev/config/
	test: {
		include: [
			'tests/**/*.test.[j|t]s'
		],
		coverage: {
			provider: 'istanbul',
			include: [ 'src/*' ],
			thresholds: {
				100: true
			},
			reporter: [
				'text-summary',
				'html',
				'lcovonly',
				'json'
			]
		},
		browser: {
			enabled: true,
			headless: true,
			provider: 'webdriverio',
			name: 'chrome',
			screenshotFailures: false
		}
	}
} );
