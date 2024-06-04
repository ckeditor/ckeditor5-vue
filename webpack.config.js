/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const { dependencies, peerDependencies } = require( './package.json' );

const externals = Object.keys( { ...dependencies, ...peerDependencies } ).reduce( ( acc, currentValue ) => {
	acc[ currentValue ] = currentValue;

	return acc;
}, {} );

module.exports = {
	mode: 'production',
	devtool: 'source-map',
	entry: path.join( __dirname, 'src', 'plugin.ts' ),
	externals,

	output: {
		library: 'CKEditor',

		path: path.join( __dirname, 'dist' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	plugins: [
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} )
	],

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.([cm]?ts|tsx)$/,
				loader: 'ts-loader'
			}
		]
	},

	resolve: {
		extensions: [ '.ts', '.tsx', '.js' ],
		extensionAlias: {
			'.ts': [ '.js', '.ts' ],
			'.cts': [ '.cjs', '.cts' ],
			'.mts': [ '.mjs', '.mts' ]
		}
	}
};
