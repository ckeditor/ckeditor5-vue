Changelog
=========

## [1.0.3](https://github.com/ckeditor/ckeditor5-vue/compare/v1.0.2...v1.0.3) (2020-09-22)

### Bug fixes

* The editor should now slow down with lots of content when using the integration. Closes [#153](https://github.com/ckeditor/ckeditor5-vue/issues/153). ([commit](https://github.com/ckeditor/ckeditor5-vue/commit/df4410a077c5eed5b95533f26f28e88882af289d))

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
