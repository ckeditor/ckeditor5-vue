# CKEditor 5 rich text editor component for Vue.js 3+

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)
[![CircleCI](https://circleci.com/gh/ckeditor/ckeditor5-vue.svg?style=shield)](https://app.circleci.com/pipelines/github/ckeditor/ckeditor5-vue?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-vue/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-vue?branch=master)
![Dependency Status](https://img.shields.io/librariesio/release/npm/@ckeditor/ckeditor5-vue)

⚠️ This repository contains the CKEditor 5 component for Vue.js `3+`. The component for lower Vue.js versions is located in another repository - [@ckeditor/ckeditor5-vue2](https://github.com/ckeditor/ckeditor5-vue2).

Official [CKEditor 5](https://ckeditor.com/ckeditor-5/) rich text editor component for Vue.js.

## [Developer Documentation](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) 📖

See the ["Rich text editor component for Vue.js"](https://ckeditor.com/docs/ckeditor5/llatest/getting-started/installation/vuejs-v3.html) guide in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest) to learn more:

* [Quick start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#quick-start)
* [Using CKEditor 5 builder](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#using-ckeditor-5-builder)
* [Installing from npm](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#installing-from-npm)
* [Using component locally](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#using-the-component-locally)
* [Component directives](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#component-directives)
* [Component events](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#component-events)

## Contributing

After cloning this repository, install necessary dependencies:

```bash
npm install
```

You can also use [Yarn](https://yarnpkg.com/).

### Running the development server

To manually test the editor integration, you can start the development server using one of the commands below:

```bash
npm run dev
```

### Executing tests

To test the editor integration against a set of automated tests, run the following command:

```bash
npm run test
```

If you want to run the tests in watch mode, use the following command:

```bash
npm run test:watch
```

### Building the package

To build the package that is ready to publish, use the following command:

```bash
npm run build
```

## Releasing package

### Prerequisites

Before releasing a new version, run a demo project to confirm that the integration works in a real-world scenario.

1. Reinstall the dependencies.
2. Run `npm run dev` to see if the integration works as expected.
3. Run `npm run test` to see if the project passes all automated tests.
4. Run `npm run build` to see if the project with the integration builds without errors.

### Changelog

Before starting the release process, you need to generate the changelog:

```bash
npm run changelog
```

### Publishing

After generating the changelog, you are able to release the package.

First, you need to bump the version:

```bash
npm run release:prepare-packages
```

After bumping the version, you can publish the changes:

```bash
npm run release:publish-packages
```

Note: The `release/` directory will be published.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the LICENSE.md file.
