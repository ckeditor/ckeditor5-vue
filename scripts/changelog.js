#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

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
