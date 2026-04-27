Changelog
=========

## [8.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-vue/compare/v7.4.2...v8.0.0-alpha.0) (April 27, 2026)

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


## [7.4.2](https://github.com/ckeditor/ckeditor5-vue/compare/v7.4.1...v7.4.2) (April 15, 2026)

### Bug fixes

* Fixed an issue where the editor's alpha version was being compared incorrectly.


## [7.4.1](https://github.com/ckeditor/ckeditor5-vue/compare/v7.4.0...v7.4.1) (April 13, 2026)

### Other changes

* Improved compatibility with the latest CKEditor 48.x. Closes [#400](https://github.com/ckeditor/ckeditor5-vue/issues/400).


## [7.4.0](https://github.com/ckeditor/ckeditor5-vue/compare/v7.3.1...v7.4.0) (March 24, 2026)

### Features

* Added support for CKEditor 5 `48.0.0` and the new `roots` editor configuration. Closes [#397](https://github.com/ckeditor/ckeditor5-vue/issues/397).


## [7.3.1](https://github.com/ckeditor/ckeditor5-vue/compare/v7.3.0...v7.3.1) (February 16, 2026)

### Other changes

* Added logging CDN fetch errors to console when an exception is thrown.
* Upgrade the development environment to Node v24.11.
* Accept internal CKEditor 5 releases in `peerDependencies`. Closes [#386](https://github.com/ckeditor/ckeditor5-vue/issues/386).

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-vue/releases).
