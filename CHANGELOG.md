Changelog
=========

## [8.2.0](https://github.com/ckeditor/ckeditor5-vue/compare/v8.2.0-alpha.0...v8.2.0) (July 13, 2026)

### Features

* Added experimental multi-root editor integration with the `CkeditorMultiRoot`, `CkeditorMultiRootToolbar`, and `CkeditorMultiRootEditable` components and the `useMultiRootEditor()` composable.

  **This feature is experimental.** Its API is not stable and may change in any release without a major version bump.


## [8.2.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v8.1.1...v8.2.0-alpha.0) (June 22, 2026)

### Features

* Added multi-root editor integration with the `CkeditorMultiRoot`, `CkeditorMultiRootToolbar`, and `CkeditorMultiRootEditable` components and the `useMultiRootEditor()` composable.


## [8.1.1](https://github.com/ckeditor/ckeditor5-vue/compare/v8.1.0...v8.1.1) (June 9, 2026)

### Bug fixes

* Fixed a crash when using `InlineEditor` with the `CKEditor` component and CKEditor 5 `>= 48.0.0`. Closes [#422](https://github.com/ckeditor/ckeditor5-vue/issues/422).


## [8.1.0](https://github.com/ckeditor/ckeditor5-vue/compare/v8.0.0...v8.1.0) (June 8, 2026)

### Features

* Added support for the paragraph-like editor feature. It is now possible to customize the editable element's tag name, classes, styles, and attributes by passing `config.root.element` or `config.roots.main.element` through the integration.

  The configuration value can be a plain string (tag name) or an object:

  ```html
  <template>
      <ckeditor :editor="BalloonEditor" :config="config" />
  </template>

  <script setup>
  import { BalloonEditor } from 'ckeditor5';

  const config = {
      root: {
          element: {
              name: 'article',
              classes: [ 'my-editor', 'custom-class' ],
              styles: { color: 'red' },
              attributes: { role: 'textbox' }
          }
      }
  };
  </script>
  ```

  To configure the root as a paragraph-like (inline-content only) editor, also pass `modelElement: '$inlineRoot'`:

  ```js
  const config = {
      root: {
          element: 'h1',
          modelElement: '$inlineRoot',
          initialData: 'Document title',
          placeholder: 'Enter title...'
      }
  };
  ```

  For editors that use the Vue-rendered element as their editable (such as Inline or Balloon editor), the editable falls back to the `tagName` prop (`div` by default) when no element definition is provided in the config. For the Classic editor, which creates its own editable internally, `config.root.element` (or `config.roots.main.element`) should always be provided explicitly.

  The `tagName` property has been deprecated in favor of this new configuration.

### Other changes

* Readme simplification.


## [8.0.0](https://github.com/ckeditor/ckeditor5-vue/compare/v8.0.0-alpha.0...v8.0.0) (May 5, 2026)

### BREAKING CHANGES

* The `ready`, `error`, and `destroy` events can now be emitted multiple times during a component's lifetime when the watchdog is active.

  By default, the editor is wrapped with a watchdog that automatically restarts it after a crash. As a result, these events may fire repeatedly — `error` after each crash, `destroy` for each crashed editor, and `ready` after each successful watchdog restart — rather than only once during the component's mount/unmount lifecycle.

  Additionally, `destroy` is no longer emitted when the component unmounts before the editor finishes initializing (it now fires only when an actual editor instance is destroyed). If your handlers relied on `@destroy` to detect component unmount, use Vue's `onBeforeUnmount` lifecycle hook instead

### Features

* You can now listen to the new `@error` event to catch and handle any errors that occur during editor initialization or at runtime (including errors automatically detected and reported by the Watchdog).
* Full Watchdog support has been added to the `<ckeditor>` component:

  * The editor is now automatically wrapped with CKEditor 5’s Watchdog (unless you explicitly pass `disableWatchdog: true`). This gives you automatic crash recovery, error detection, and editor restarts without breaking your Vue component.

  * New `watchdogConfig` prop for the Watchdog integration. You can now pass a full configuration object to customize its behavior:

  ```vue
  <ckeditor
    :watchdog-config="{
      crashNumberLimit: 5,
      minimumTimeBetweenCrashes: 1000,
      // any other Watchdog options...
    }"
    ...
  />
  ```

### Bug fixes

* Significantly improved stability during rapid component destruction (e.g. fast route changes, v-if toggling, or Suspense scenarios).

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-vue/releases).
