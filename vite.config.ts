/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { webdriverio } from '@vitest/browser-webdriverio';

const require = createRequire( import.meta.url );
const pkg = require( './package.json' );

export default defineConfig( {
	plugins: [
		vue()
	],

	envPrefix: 'CKEDITOR_',

	build: {
		minify: false,
		sourcemap: true,
		target: 'es2019',

		// https://vitejs.dev/guide/build#library-mode
		lib: {
			entry: resolve( import.meta.dirname, 'src/plugin.ts' ),
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
					'lodash-es': '_',
					'@ckeditor/ckeditor5-integrations-common': 'CKEDITOR_INTEGRATIONS_COMMON'
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
		setupFiles: [ './vitest-setup.ts' ],
		include: [
			'tests/**/*.test.[j|t]s'
		],
		coverage: {
			provider: 'istanbul',
			include: [ 'src/**/*.{ts,vue}' ],
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
			screenshotFailures: false,
			provider: webdriverio( {
				capabilities: {
					'goog:chromeOptions': {
						args: [ '--headless', '--disable-gpu', '--no-sandbox' ]
					}
				}
			} ),
			instances: [
				{ browser: 'chrome' }
			]
		}
	},

	define: {
		__VUE_INTEGRATION_VERSION__: JSON.stringify( pkg.version )
	}
} );
