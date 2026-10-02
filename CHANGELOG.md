Changelog
=========

## [9.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-vue/compare/v9.0.0-alpha.1...v9.0.0-alpha.2) (October 2, 2026)

### Features

* Added support for using the `<Ckeditor>` component inside `<KeepAlive>`. With `ClassicEditor`, the editor UI is now moved together with the component when it is deactivated and put back when it is activated, instead of staying on the page. The same editor instance is kept, so its content and undo history are preserved.

### Bug fixes

* Fixed the `Failed to execute 'insertBefore' on 'Node'` error thrown when the `<Ckeditor>` component with `ClassicEditor` was replaced, for example after changing its `:key`. Vue used the editor UI as the insertion point for the new component and the editor removed it while being destroyed.


## [9.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-vue/compare/v9.0.0-alpha.0...v9.0.0-alpha.1) (October 1, 2026)

### Features

* Added support for Trusted Types when loading CKEditor 5 from CDN with the `useCKEditorCloud()` composable. Script URLs are now passed through the `ckeditor5-integrations` Trusted Types policy, so applications that enforce Trusted Types with the `require-trusted-types-for 'script'` CSP directive only need to add `ckeditor5-integrations` to the `trusted-types` directive.


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-vue/releases).
