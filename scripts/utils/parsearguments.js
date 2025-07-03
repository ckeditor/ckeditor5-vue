/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import minimist from 'minimist';

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
export default function parseArguments( cliArguments ) {
	const config = {
		boolean: [
			'verbose',
			'compile-only',
			'ci',
			'dry-run'
		],

		string: [
			'branch',
			'from',
			'npm-tag',
			'date'
		],

		default: {
			branch: 'master',
			ci: false,
			'compile-only': false,
			'npm-tag': null,
			verbose: false,
			date: undefined,
			'dry-run': false
		}
	};

	const options = minimist( cliArguments, config );

	options.compileOnly = options[ 'compile-only' ];
	delete options[ 'compile-only' ];

	options.npmTag = options[ 'npm-tag' ];
	delete options[ 'npm-tag' ];

	options.dryRun = options[ 'dry-run' ];
	delete options[ 'dry-run' ];

	if ( process.env.CI ) {
		options.ci = true;
	}

	return options;
}

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {String} [branch='master']
 *
 * @property {String|null} [npmTag=null]
 *
 * @property {Boolean} [compileOnly=false]
 *
 * @property {Boolean} [verbose=false]
 *
 * @property {Boolean} [ci=false]
 *
 * @property {String} [date=undefined]
 *
 * @property {Boolean} [dryRun=false]
 */
