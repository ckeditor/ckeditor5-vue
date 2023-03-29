#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const { execSync } = require( 'child_process' );

execSync( 'yarn build', { stdio: 'inherit' } );
execSync( 'cd demo', { stdio: 'inherit' } );
execSync( 'yarn install', { stdio: 'inherit' } );
execSync( 'yarn build', { stdio: 'inherit' } );
