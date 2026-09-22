Changelog
=========

## [9.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v8.2.0...v9.0.0-alpha.0) (September 22, 2026)

### BREAKING CHANGES

* The Watchdog is gone, and with it the automatic restart of a crashed editor. An editor that crashes now stays as it is, with its content and its undo history, instead of being rebuilt from the data it had before. The `error` event still reports what happened, in both phases.

  * **CKEditor 5 in version 49 or higher is now required.** That is where the error reporting this integration uses appears. The declared peer dependency and the runtime version check were raised to match.
  * The `watchdog-config` and `disable-watchdog` props were removed from `<ckeditor>` and `<ckeditor-multi-root>`, and the matching `watchdogConfig` and `disableWatchdog` options from `useMultiRootEditor()`. There is no watchdog left to configure or disable.
  * The runtime variant of `EditorErrorDescription` no longer carries `causesRestart` or the `watchdog` instance. Nothing restarts, so there is nothing to announce, and the `EditorWatchdog` class no longer exists. It still carries `phase` and the `editor` the error came from.
  * `MultiRootEditorWithWatchdogRelaxedConstructor` was renamed to `MultiRootEditorRelaxedConstructor`. Where the old type mentioned an optional static `EditorWatchdog`, the new one requires a static `onEditorError` — every editor class has one, so only a hand-written editor class has to do anything about it.
  * Runtime errors are now reported in cases where they were not before. The runtime half of the `error` event used to exist only when a watchdog was actually attached, so an editor created with `disable-watchdog`, or one whose class did not expose a static `EditorWatchdog`, never reported anything at runtime. Every editor reports now.
  * Remove the `watchdog-config` and `disable-watchdog` bindings from your templates. They are no longer declared props, so Vue passes them through to the rendered element as plain attributes instead of ignoring them.

  Integrators who relied on the restart should handle the `error` event themselves — reload the editor, tell the user, or report to their error tracker.

### Features

* The stylesheets loaded by `useCKEditorCloud()` can now be injected into a shadow root instead of `document.head`, so the editor styles stay scoped to a web component rather than leaking into the page. Pass the root as `targetNode` of the `injectedStylesheetsLocation` option.


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-vue/releases).
