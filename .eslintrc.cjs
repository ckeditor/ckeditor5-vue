/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global module */

// Note: The ESLint configuration is mandatory for vue-cli.
module.exports = {
	'extends': [
		'plugin:vue/vue3-recommended',
		'ckeditor5'
	],
	// https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser
	'parser': 'vue-eslint-parser',
	'parserOptions': {
		'parser': '@typescript-eslint/parser',
		'sourceType': 'module'
	},
	'rules': {
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
		'vue/multi-word-component-names': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [ 'error' ]
	},
	'overrides': [
		{
			'files': [
				'**/*.vue'
			],
			'rules': {
				'ckeditor5-rules/license-header': 'off'
			}
		}
	]
};
