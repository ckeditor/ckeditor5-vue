#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import parseArguments from './utils/parsearguments.js';

/**
 * Scripts for generating the changelog before starting the release process.
 */

const cliArguments = parseArguments( process.argv.slice( 2 ) );

import { generateChangelogForSinglePackage } from '@ckeditor/ckeditor5-dev-release-tools';

await generateChangelogForSinglePackage( {
	from: cliArguments.from,
	releaseBranch: cliArguments.branch
} );
