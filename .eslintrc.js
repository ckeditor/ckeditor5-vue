/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global module */

// Note: The ESLint configuration is mandatory for vue-cli.
module.exports = {
	'extends': 'ckeditor5',
	'rules': {
		'ckeditor5-rules/license-header': [ 'error', { headerLines: [
			'/**',
			' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
			' * For licensing, see LICENSE.md.',
			' */'
		] } ]
	}
};
