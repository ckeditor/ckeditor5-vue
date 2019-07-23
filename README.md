# CKEditor 5 rich text editor component for Vue.js

[![Join the chat at https://gitter.im/ckeditor/ckeditor5](https://badges.gitter.im/ckeditor/ckeditor5.svg)](https://gitter.im/ckeditor/ckeditor5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)
[![Build Status](https://travis-ci.org/ckeditor/ckeditor5-vue.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5-vue)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-vue/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-vue?branch=master)
<br>
[![Dependency Status](https://david-dm.org/ckeditor/ckeditor5-vue/status.svg)](https://david-dm.org/ckeditor/ckeditor5-vue)
[![devDependency Status](https://david-dm.org/ckeditor/ckeditor5-vue/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor5-vue?type=dev)

Official [CKEditor 5](https://ckeditor.com/ckeditor-5/) rich text editor component for Vue.js.

## [Developer Documentation](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) 📖

See the ["Rich text editor component for Vue.js"](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) guide in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest) to learn more:

* [Quick start](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#quick-start)
* [Using component locally](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#using-component-locally)
* [Using CKEditor from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#using-ckeditor-from-source)
* [Using the Document editor build](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#using-the-document-editor-build)
* [Component directives](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#component-directives)
* [Component events](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html#component-events)

## Contributing

After cloning this repository, install necessary dependencies:

```bash
npm install
```

### Executing tests

```bash
npm run test -- [additional options]
# or
npm t -- [additional options]
```

The command accepts the following options:

* `--coverage` (`-c`) &ndash; Whether to generate the code coverage.
* `--source-map` (`-s`) &ndash; Whether to attach the source maps.
* `--watch` (`-w`) &ndash; Whether to watch test files.
* `--reporter` (`-r`) &ndash; Reporter for Karma (default: `mocha`, can be changed to `dots`).
* `--browsers` (`-b`) &ndash; Browsers that will be used to run tests (default: `Chrome`, available: `Firefox`, `BrowserStack_Edge` and `BrowserStack_Safari`).

**Note:** If you would like to use the `BrowserStack_*` browser, you need to specify the `BROWSER_STACK_USERNAME` and `BROWSER_STACK_ACCESS_KEY` as
an environment variable, e.g.:

```bash
BROWSER_STACK_USERNAME=[...] BROWSER_STACK_ACCESS_KEY=[...] npm t -- -b BrowserStack_Edge,BrowserStack_Safari -c
```

If you are going to change the component (`src/ckeditor.js`) or plugin (`src/plugin.js`) files, remember about rebuilding the package. You can use `npm run develop` in order to do it automatically.

### Building the package

Build a minified version of the package that is ready to publish:

```bash
npm run build
```

### Changelog generator

```bash
npm run changelog
```

### Testing component with Vue CLI

When symlinking the component in an application generated using [Vue CLI](https://cli.vuejs.org/), make sure your `vue.config.js` file configures webpack in the following way:

```js
module.exports = {
	configureWebpack: {
		resolve: {
			symlinks: false
		}
	}
};
```

Otherwise, the application will fail to load the component correctly and, as a result, it will throw a build error.

## Releasing package

### Changelog

Before starting the release process, you need to generate the changelog:

```bash
npm run changelog
```

### Publishing

After generating the changelog, you are able to release the package.

First, you need to bump the version:

```bash
npm run release:bump-version
```

You can also use the `--dry-run` option in order to see what this task does.

After bumping the version, you can publish the changes:

```bash
npm run release:publish
```

Note: Only the `dist/` directory will be published.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the LICENSE.md file.
