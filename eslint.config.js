/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import globals from 'globals';
import { defineConfig } from 'eslint/config';
import ckeditor5Rules from 'eslint-plugin-ckeditor5-rules';
import ckeditor5Config from 'eslint-config-ckeditor5';
import pluginVue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';

export default defineConfig( [
	{
		ignores: [
			'coverage/**',
			'dist/**',
			'release/**'
		]
	},

	{
		extends: ckeditor5Config,

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser
			}
		},

		linterOptions: {
			reportUnusedDisableDirectives: 'warn',
			reportUnusedInlineConfigs: 'warn'
		},

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/license-header': [ 'error', { headerLines: [
				'/**',
				' * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options',
				' */'
			] } ],
			'ckeditor5-rules/require-file-extensions-in-imports': [
				'error',
				{
					extensions: [ '.ts', '.js', '.json' ]
				}
			],
			'ckeditor5-rules/prevent-license-key-leak': 'error',
			'no-unused-vars': 'off'
		}
	},

	// Rules recommended by the Vue plugin that apply to all files.
	{
		extends: pluginVue.configs[ 'flat/recommended' ],

		files: [
			'**/*.vue',
			'**/*.ts'
		],

		rules: {
			'vue/multi-word-component-names': 'off'
		}
	},

	// Rules specific to `.vue` files.
	{
		files: [ '**/*.vue' ],

		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		},

		rules: {
			'ckeditor5-rules/license-header': 'off'
		}
	},

	// Rules specific to `scripts` folder.
	{
		files: [ 'scripts/**/*' ],

		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},

	// Rules specific to changelog files.
	{
		extends: ckeditor5Config,

		files: [ '.changelog/**/*.md' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/validate-changelog-entry': [ 'error', {
				repositoryType: 'single'
			} ]
		}
	}
] );
