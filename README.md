# CKEditor 5 rich text editor component for Vue.js 3+

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)
[![Build Status](https://app.travis-ci.com/ckeditor/ckeditor5-vue.svg?branch=master)](https://app.travis-ci.com/ckeditor/ckeditor5-vue)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-vue/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-vue?branch=master)
![Dependency Status](https://img.shields.io/librariesio/release/npm/@ckeditor/ckeditor5-vue)

⚠️ This repository contains the CKEditor 5 component for Vue.js `3+`. The component for lower Vue.js versions is located in another repository - [@ckeditor/ckeditor5-vue2](https://github.com/ckeditor/ckeditor5-vue2).

Official [CKEditor 5](https://ckeditor.com/ckeditor-5/) rich text editor component for Vue.js.

## [Developer Documentation](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) 📖

See the ["Rich text editor component for Vue.js"](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) guide in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest) to learn more:

* [Quick start](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#quick-start)
* [Using component locally](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#using-component-locally)
* [Using CKEditor from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#using-ckeditor-from-source)
* [Using the Document editor build](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#using-the-document-editor-build)
* [Component directives](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#component-directives)
* [Component events](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html#component-events)

## Contributing

After cloning this repository, install necessary dependencies:

```bash
yarn install
```

### Executing tests

```bash
yarn run test -- [additional options]
# or
yarn t -- [additional options]
```

The command accepts the following options:

* `--coverage` (`-c`) &ndash; Whether to generate the code coverage.
* `--source-map` (`-s`) &ndash; Whether to attach the source maps.
* `--watch` (`-w`) &ndash; Whether to watch test files.
* `--reporter` (`-r`) &ndash; Reporter for Karma (default: `mocha`, can be changed to `dots`).
* `--browsers` (`-b`) &ndash; Browsers that will be used to run tests (default: `Chrome`, available: `Firefox`).

If you are going to change the component (`src/ckeditor.js`) or plugin (`src/plugin.js`) files, remember about rebuilding the package. You can use `yarn run develop` in order to do it automatically.

### Building the package

Build a minified version of the package that is ready to publish:

```bash
yarn run build
```

### Changelog generator

```bash
yarn run changelog
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

### Prerequisites

Before releasing a new version, run a demo project to confirm that the integration works in a real-world scenario.

1. Navigate to the `demo` folder.
2. Reinstall the dependencies.
3. Run `yarn dev` to see if the integration works as expected.
4. Run `yarn build` to see if the project with the integration builds without errors.

```Text
Dependencies in the `demo` project need to be reinstalled after any changes to the integration, because in `package.json` we use `file:` instead of `link:` due to Vite limitations. Unlike `link:`, which creates a symlink to the integration, `file:` copies its contents when `yarn install` is run and never updates after that.
```

### Changelog

Before starting the release process, you need to generate the changelog:

```bash
yarn run changelog
```

### Publishing

After generating the changelog, you are able to release the package.

First, you need to bump the version:

```bash
yarn run release:bump-version
```

You can also use the `--dry-run` option in order to see what this task does.

After bumping the version, you can publish the changes:

```bash
yarn run release:publish
```

Note: Only the `dist/` directory will be published.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the LICENSE.md file.
