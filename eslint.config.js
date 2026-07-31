/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
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
				' * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.',
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

	// Less strict checks for demo page styling. These files are not editor theme styling and are not shipped
	// to npm - they exist to override editor defaults on a sample page, which is what the rules below forbid.
	{
		files: [ 'demos/**/*.css' ],

		rules: {
			// Demo pages use plain colors. The HSL / custom property requirement targets theme files,
			// where colors must stay overridable.
			'ckeditor5-rules/no-disallowed-color-formats': 'off',

			// A demo overriding `.ck-editor__editable` defaults is exactly what `!important` is for here.
			'css/no-important': 'off',

			// TODO (RTL): off pending a migration of physical properties/values to logical, the same way
			// the `ckeditor5` repository defers it.
			'css/prefer-logical-properties': 'off',

			'css/use-baseline': 'off'
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
