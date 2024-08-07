Changelog
=========

## [7.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v6.0.0...v7.0.0) (2024-08-07)

We are excited to announce a new major release of the Vue integration.

In this release, we have introduced the following breaking changes that should make using the integration more intuitive and easier.

* **Composition API**: The integration has been rewritten in Composition API, which follows the recommended way of writing components in Vue 3.
* **Vue 3.4+**: The minimum required version of Vue is now 3.4+ because we are using the [Generics](https://vuejs.org/api/sfc-script-setup.html#generics) and [`defineModel()`](https://vuejs.org/api/sfc-script-setup.html#definemodel) features to provide better typings for the `editor` prop and component events.
* **ESM-first**: Besides the UMD build, the integration is now available in ESM format. In most projects, the new ESM build should be automatically prioritized by bundlers and other tools.
* **Changed exports**: We have changed how the Vue plugin and component are exported. The Vue plugin is no longer the `default` export but is exported as `CkeditorPlugin`. The component is now exported as `Ckeditor` instead of `default.component`.

  Here's a comparison of how you can import the Vue plugin that registers a global `<ckeditor>` component:

  ```ts
  // Before the release.
  import CKEditor from '@ckeditor/ckeditor5-vue';

  // After the release.
  import { CkeditorPlugin } from '@ckeditor/ckeditor5-vue';
  ```

  If you prefer to use a local component instead of a global component, here's a comparison of how you can import it:

  ```ts
  // Before the release.
  import CKEditor from '@ckeditor/ckeditor5-vue';

  const component = CKEditor.component;

  // After the release.
  import { Ckeditor } from '@ckeditor/ckeditor5-vue';

  const component = Ckeditor;
  ```

* **Remove the `editor` argument from the `destroy` event**: The `destroy` event no longer has an `editor` argument since it was always `null`.
* **New name of the global variable**: The name of the global variable used in the UMD build changed from `CKEditor` to `CKEDITOR_VUE`.

### BREAKING CHANGES

* Bump required version to Vue 3.4+. See [#282](https://github.com/ckeditor/ckeditor5-vue/issues/282).
* Change the global name used in the UMD build from `CKEditor` to `CKEDITOR_VUE`.
* Export the component as `Ckeditor` instead of `default.component`. Closes [#284](https://github.com/ckeditor/ckeditor5-vue/issues/284).
* Migrate to Composition API. Closes [#172](https://github.com/ckeditor/ckeditor5-vue/issues/172).
* Migrate to ESM. See [ckeditor/ckeditor5#16616](https://github.com/ckeditor/ckeditor5/issues/16616).
* Remove argument from the `destroy` event, as it was always `null`. Closes [#283](https://github.com/ckeditor/ckeditor5-vue/issues/283).
* Rename main package exports to `CkeditorPlugin` and `Ckeditor`.

### Bug fixes

* Change the global name used in the UMD build from `CKEditor` to `CKEDITOR_VUE` to match the new convention. See [ckeditor/ckeditor5#16736](https://github.com/ckeditor/ckeditor5/issues/16736). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/eba73a525e1422ff3a3a1a95825d6c4807b3a232))
* Fix the component properties and event types. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/e2a9bbcaec754ab680fc28dae545ea27defe68e3))
* Use type of the passed `editor` prop rather than generic `Editor` type. Closes [#282](https://github.com/ckeditor/ckeditor5-vue/issues/282). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/c82a0040dfd2f23a87aca257c354b6a2c302c340))

### Other changes

* Rename exports to improve name of the editor component in Vue. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/fac44822ca6f41c9a7ea4b529b6274da1ee66cfc))

## [7.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-vue/compare/v7.0.0-alpha.1...v7.0.0-alpha.2) (2024-07-17)

### BREAKING CHANGES

* Change the global name used in the UMD build from `CKEditor` to `CKEDITOR_VUE`.

### Bug fixes

* Change the global name used in the UMD build from `CKEditor` to `CKEDITOR_VUE` to match the new convention. See [ckeditor/ckeditor5#16736](https://github.com/ckeditor/ckeditor5/issues/16736). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/eba73a525e1422ff3a3a1a95825d6c4807b3a232))
* Fix the component properties and event types. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/e2a9bbcaec754ab680fc28dae545ea27defe68e3))


## [7.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-vue/compare/v7.0.0-alpha.0...v7.0.0-alpha.1) (2024-07-16)

### BREAKING CHANGES

* Rename main package exports to `CkeditorPlugin` and `Ckeditor`.

### Other changes

* Rename exports to improve name of the editor component in Vue. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/fac44822ca6f41c9a7ea4b529b6274da1ee66cfc))


## [7.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v6.0.0...v7.0.0-alpha.0) (2024-07-15)

We are excited to announce the alpha release of the next major version of the Vue integration.

In this release, we have introduced the following breaking changes that should make using the integration more intuitive and easier.

- **Composition API**: The integration has been rewritten in Composition API, which follows the recommended way of writing components in Vue 3.
- **Vue 3.4+**: The minimum required version of Vue is now 3.4+ because we are using the [Generics](https://vuejs.org/api/sfc-script-setup.html#generics) and [`defineModel()`](https://vuejs.org/api/sfc-script-setup.html#definemodel) features to provide better typings for the `editor` prop and component events.
- **ESM-first**: Besides the UMD build, the integration is now available in ESM format. In most projects, the new ESM build should be automatically prioritized by bundlers and other tools.
- **Changed exports**: We have changed how the Vue plugin and component are exported. The Vue plugin is no longer the `default` export but is exported as `CKEditorPlugin`. The component is now exported as `CKEditor` instead of `default.component`.

  Here's a comparison of how you can import the Vue plugin that registers a global `<ckeditor>` component:

  ```diff
  // Before the change
  import CKEditor from '@ckeditor/ckeditor5-vue';

  // After the changes
  import { CKEditorPlugin } from '@ckeditor/ckeditor5-vue';
  ```

  If you prefer to use a local component instead of a global component, here's a comparison of how you can import it:

  ```diff
  // Before the change
  import CKEditor from '@ckeditor/ckeditor5-vue';

  const component = CKEditor.component;

  // After the changes
  import { CKEditor } from '@ckeditor/ckeditor5-vue';

  const component = CKEditor;
  ```

- **Remove the `editor` argument from the `destroy` event**: The `destroy` event no longer has an `editor` argument since it was always `null`.

### BREAKING CHANGES

* The `@ckeditor/ckeditor5-vue` package requires Vue 3.4+. See [#282](https://github.com/ckeditor/ckeditor5-vue/issues/282).
* Export the component as `CKEditor` instead of `default.component`. Closes [#284](https://github.com/ckeditor/ckeditor5-vue/issues/284).
* Migrate to Composition API. Closes [#172](https://github.com/ckeditor/ckeditor5-vue/issues/172).
* Migrate to ESM. See [ckeditor/ckeditor5#16616](https://github.com/ckeditor/ckeditor5/issues/16616).
* Remove the argument from the `destroy` event, as it was always `null`. Closes [#283](https://github.com/ckeditor/ckeditor5-vue/issues/283).
* Replace the default export with named `CKEditorPlugin` export.

### Bug fixes

* Use the type of the passed `editor` prop rather than generic `Editor` type. Closes [#282](https://github.com/ckeditor/ckeditor5-vue/issues/282). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/c82a0040dfd2f23a87aca257c354b6a2c302c340))

### Other changes

* Add UMD for better backward compatibility. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/0412b19f26ef954a7cf8fb8c2bc7d1bce686e0e6))
* Updated yarn.lock to fix dependabot alert. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/e0d7a9e9c974025f6d0060b70d1d19718cb14f48))


## [6.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v6.0.0-alpha.0...v6.0.0) (2024-06-26)

We are excited to announce the next major version of the Vue integration.

This release is intended to allow the integration to work with the [latest version](https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0) of [new installation methods](https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0).


## [6.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v5.1.0...v6.0.0-alpha.0) (2024-06-05)

We are happy to announce the alpha release of the next major version of the React integration.

This release is intended to allow the integration to work with existing and new installation methods [announced in this post](https://github.com/ckeditor/ckeditor5/issues/15502).

Please refer to [our nightly documentation build](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/index.html) for the installation instructions.

### Features

* Change the implementation to only depend on types from the `ckeditor5` packages and not runtime code to make the integration work with existing and new installation methods. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/4048cecacf4cb7877a3d0d00496d809468a96d76))

### Other changes

* Updated the required version of Node.js to 18 when developing the repository. See [ckeditor/ckeditor5#14924](https://github.com/ckeditor/ckeditor5/issues/14924). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/7c2ed354ac4330063829d1be7358ef6f11027924))


## [5.1.0](https://github.com/ckeditor/ckeditor5-vue/compare/v5.0.0...v5.1.0) (2023-04-18)

### Features

* Added `disableTwoWayDataBinding` property that allows disabling the two-way data binding. It increases performance when working with large documents. Closes [ckeditor/ckeditor5-vue#246](https://github.com/ckeditor/ckeditor5-vue/issues/246). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/928e2d2171b74b9e2fd8aff72320e0745a767c18))


## [5.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v4.0.1...v5.0.0) (2023-04-07)

### Release highlights

This release introduces improved TypeScript support for better code suggestion and completion.

### BREAKING CHANGES

* Due to rewriting to TypeScript, the component requires CKEditor 5 typings that are available in version 37 or higher. See ckeditor/ckeditor5#11704.
* Upgraded the minimal versions of Node.js to `16.0.0` due to the end of LTS.

### Features

* Migrate the package to Typescript. Closes [ckeditor/ckeditor5#13543](https://github.com/ckeditor/ckeditor5/issues/13543). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/8ee793f09b002851759d0e1dfdb947b06624e4ef), ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/3395eb055f7c3d78beef4ae12fba5b492c364aea)))

### Other changes

* Updated the required version of Node.js to 16. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/89a04fc8768d0f54ad577caceff23bb67f2cf972))
* Added a missing postinstall script to the published files. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/0949df7dc41cbe7062f5e6b42615da395ffd4a55))

## [5.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-vue/compare/v5.0.0-alpha.1...v5.0.0-alpha.2) (2023-03-29)

### BREAKING CHANGES

* Due to rewriting to TypeScript, the component requires CKEditor 5 typings that are available in version 37 or higher. See ckeditor/ckeditor5#11704.
* Upgraded the minimal versions of Node.js to `16.0.0` due to the end of LTS.

### Features

* Improve typings for events emitted by the Vue component. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/3395eb055f7c3d78beef4ae12fba5b492c364aea))

### Other changes

* Updated the required version of Node.js to 16. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/89a04fc8768d0f54ad577caceff23bb67f2cf972))


## [5.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-vue/compare/v5.0.0-alpha.0...v5.0.0-alpha.1) (2023-03-17)

### Other changes

* Added a missing postinstall script to published files. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/0949df7dc41cbe7062f5e6b42615da395ffd4a55))


## [5.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v4.0.1...v5.0.0-alpha.0) (2023-03-17)

### Release highlights

This release introduces improved TypeScript support for better code suggestion and completion.

Please keep in mind that the release is marked as alpha, which means it is an experimental version, and some unexpected results may occur when using these typings.

We appreciate your feedback, as it helps us significantly improve the project's final shape. Please share it [here](https://github.com/ckeditor/ckeditor5/issues/11704).

### Features

* Migrate the package to Typescript. Closes [ckeditor/ckeditor5#13543](https://github.com/ckeditor/ckeditor5/issues/13543). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/8ee793f09b002851759d0e1dfdb947b06624e4ef))


## [4.0.1](https://github.com/ckeditor/ckeditor5-vue/compare/v4.0.0...v4.0.1) (2022-05-18)

### Bug fixes

* Synchronize the editor content after the editor is ready. Closes [#220](https://github.com/ckeditor/ckeditor5-vue/issues/220). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/def7735c75821522a9a28b192f4166cca0c55dfb))


## [4.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v3.0.0...v4.0.0) (2022-04-12)

### BREAKING CHANGES

* Due to introducing the lock mechanism for the `Editor#isReadOnly` property, the `<CKEditor>` component uses the new way of enabling the read-only mode in the editor. The component requires an instance of CKEditor 5 in version 34 or higher. See [ckeditor/ckeditor5#10496](https://github.com/ckeditor/ckeditor5/issues/10496).

### Other changes

* Aligned the `<CKEditor>` component API to use the new lock mechanism when enabling/disabling the read-only mode. ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/5b45af9bc81dbf65fdc4b76eafbb6ca6916ff406))
* Bumped Karma test runner to v6.x. Closes [#210](https://github.com/ckeditor/ckeditor5-vue/issues/210). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/38c25bf57b3e3dd5bf503366f9901076b9353602))


## [3.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v2.0.1...v3.0.0) (2022-03-17)

### BREAKING CHANGES

* Upgraded the minimal versions of Node.js to `14.0.0` due to the end of LTS.

### Bug fixes

* Marked the editor instance `this.instance` as a raw object so that it will never be converted to a proxy. Closes [#203](https://github.com/ckeditor/ckeditor5-vue/issues/203). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/05e2897e4274bfd584d60f02480634bff987ab8a))

### Other changes

* Updated the required version of Node.js to 14. See [ckeditor/ckeditor5#10972](https://github.com/ckeditor/ckeditor5/issues/10972). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/fd410eccc93d130fd6e50a1019915a3e0a2f2e67))


## [2.0.1](https://github.com/ckeditor/ckeditor5-vue/compare/v2.0.0...v2.0.1) (2020-11-23)

### Bug fixes

* When using the `<CKEditor>` component with an unsupported version of Vue.js, the component will display an error. Closes [#170](https://github.com/ckeditor/ckeditor5-vue/issues/170). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/300f301deeae9f8f6434c6a398c815aa3f6a0f91))


## [2.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.3...v2.0.0) (2020-11-20)

The CKEditor 5 WYSIWYG editor component is compatible with Vue.js 3+. For Vue.js 2.x, check the dedicated [`@ckeditor/ckeditor5-vue2`](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue2) component.


## [1.0.3](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.2...v1.0.3) (2020-09-22)

### Bug fixes

* The editor should not slow down with lots of content when using the integration. Closes [#153](https://github.com/ckeditor/ckeditor5-vue/issues/153). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/df4410a077c5eed5b95533f26f28e88882af289d))

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The reference to the CKEditor 5 instance previously available under the `instance` property of the component (data) is now private (`$_instance`). We recommend you use the [`ready`](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#ready) component event to access the editor API instead.

## [1.0.2](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.1...v1.0.2) (2020-09-01)

### Bug fixes

* The `#input` event should be fired immediately despite being debounced to prevent race conditions. Closes [#149](https://github.com/ckeditor/ckeditor5-vue/issues/149). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/c8ff4da551f51433398785c340c65031e63d332a))


## [1.0.1](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.0...v1.0.1) (2019-12-05)

### Bug fixes

* Editor config defined in the component should not be mutable. Closes [#101](https://github.com/ckeditor/ckeditor5-vue/issues/101). ([42651e3](https://github.com/ckeditor/ckeditor5-vue/commit/42651e3))


## [1.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.0-beta.2...v1.0.0) (2019-09-20)

### Bug fixes

* [`config.initialData`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-initialData) should be used to set the initial state of the editor instead of unsafe `innerHTML`. Closes [#51](https://github.com/ckeditor/ckeditor5-vue/issues/51). ([950b49a](https://github.com/ckeditor/ckeditor5-vue/commit/950b49a))

## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2019-04-24)

### Bug fixes

* Improved performance when editing large content. Debounced the component `#input` event. Closes [#42](https://github.com/ckeditor/ckeditor5-vue/issues/42). ([dfaee36](https://github.com/ckeditor/ckeditor5-vue/commit/dfaee36))
* The data initialization should not break collaboration. Instead of using `editor.setData()`, the initial content is now set via `innerHTML` of the source element. Closes [#47](https://github.com/ckeditor/ckeditor5-vue/issues/47). ([6f821fa](https://github.com/ckeditor/ckeditor5-vue/commit/6f821fa))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-vue/tree/v1.0.0-beta.1) (2018-11-06)

First developer preview. It contains a ready-to-use `<ckeditor>` component that allows using CKEditor 5 Builds and CKEditor 5 Framework in Vue.js applications.
