/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	combineCKCdnBundlesPacks,
	createCKCdnBaseBundlePack,
	createCKCdnPremiumBundlePack,
	loadCKCdnResourcesPack,
	type CKCdnResourcesPack,
	type CKCdnVersion,
	type InferCKCdnResourcesPackExportsType
} from './cdn';

/**
 * A composable function that loads CKEditor Cloud Services bundles.
 * It returns the exports of the loaded bundles.
 *
 * @param config The configuration of the CKEditor Cloud Services bundles to load.
 * @returns The result of the loaded CKEditor Cloud Services bundles.
 * @template A The type of the additional resources to load.
 * @example
 * ```ts
 * const { CKEditor, CKEditorPremiumFeatures } = await loadCKEditorCloud( {
 * 	version: '42.0.0',
 * 	languages: [ 'en', 'de' ],
 * 	withPremiumFeatures: true
 * } );
 *
 * const { Paragraph } = CKEditor;
 * const { SlashCommands } = CKEditorPremiumFeatures;
 */
export default function loadCKEditorCloud<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): Promise<CKEditorCloudResult<A>> {
	const { base, premium, plugins } = castConfigToAdvanced( config );

	const pack = combineCKCdnBundlesPacks( {
		CKEditor: base,
		CKEditorPremiumFeatures: premium,
		CKPlugins: plugins && combineCKCdnBundlesPacks( plugins )
	} );

	return loadCKCdnResourcesPack( pack ) as Promise<CKEditorCloudResult<A>>;
}

/**
 * Casts the simple configuration to the advanced configuration.
 *
 * @template A The type of the additional resources to load.
 * @param config The configuration to cast.
 * @returns The advanced configuration.
 */
function castConfigToAdvanced<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): CKEditorCloudAdvancedConfig<A> {
	if ( isCKEditorCloudAdvancedConfig( config ) ) {
		return config;
	}

	const { version, languages = [ 'en' ], plugins } = config;

	return {
		plugins,

		base: createCKCdnBaseBundlePack( {
			version,
			languages
		} ),

		...config.withPremiumFeatures && {
			premium: createCKCdnPremiumBundlePack( {
				version,
				languages
			} )
		}
	};
}

/**
 * Checks if the given configuration is a simple configuration.
 *
 * @param config The configuration to check.
 * @template A The type of the additional resources to load.
 */
function isCKEditorCloudAdvancedConfig<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): config is CKEditorCloudAdvancedConfig<A> {
	return !( 'version' in config );
}

/**
 * `plugins` property of the `CKEditorCloudConfig`.
 */
export type CKExternalPluginsMap = Record<string, CKCdnResourcesPack<any>>;

/**
 * The result of the resolved bundles from CKEditor Cloud Services.
 *
 * @template A The type of the additional resources to load.
 */
export type CKEditorCloudResult<A extends CKExternalPluginsMap = any> = {

	/**
	 * The base CKEditor bundle exports.
	 */
	CKEditor: Window['CKEDITOR'];

	/**
	 * The CKEditor Premium Features bundle exports.
	 */
	CKEditorPremiumFeatures?: Window['CKEDITOR_PREMIUM_FEATURES'];

	/**
	 * The additional resources exports.
	 */
	CKPlugins?: {
		[ K in keyof A ]: InferCKCdnResourcesPackExportsType<A[K]>
	};
};

/**
 * The configuration of the `useCKEditorCloud` hook.
 *
 * @template A The type of the additional resources to load.
 */
export type CKEditorCloudConfig<A extends CKExternalPluginsMap> =
	| CKEditorCloudSimpleConfig<A>
	| CKEditorCloudAdvancedConfig<A>;

/**
 * Simples configuration of the hook configuration to load the default cdn bundles.
 * It should be fully serializable to `CKEditorCloudAdvancedConfig`.
 *
 * @template A The type of the additional resources to load.
 */
type CKEditorCloudSimpleConfig<A extends CKExternalPluginsMap> = {

	/**
	 * The version of CKEditor Cloud Services to use.
	 */
	version: CKCdnVersion;

	/**
	 * The languages to load.
	 */
	languages?: Array<string>;

	/**
	 * If `true` then the premium features will be loaded.
	 */
	withPremiumFeatures?: boolean;

	/**
	 * Additional resources to load.
	 */
	plugins?: A;
};

/**
 * More sophisticated configuration of the hook configuration to load more customized cdn bundles.
 *
 * @template A The type of the additional resources to load.
 */
type CKEditorCloudAdvancedConfig<A extends CKExternalPluginsMap> = {

	/**
	 * The base CKEditor bundle configuration.
	 */
	base: CKCdnResourcesPack<Window['CKEDITOR']>;

	/**
	 * The premium features CKEditor bundle configuration.
	 */
	premium?: CKCdnResourcesPack<Window['CKEDITOR_PREMIUM_FEATURES']>;

	/**
	 * Additional resources to load.
	 */
	plugins?: A;
};
