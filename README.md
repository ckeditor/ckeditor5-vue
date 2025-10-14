# CKEditor 5 rich text editor component for Vue.js 3+

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)
[![CircleCI](https://circleci.com/gh/ckeditor/ckeditor5-vue.svg?style=shield)](https://app.circleci.com/pipelines/github/ckeditor/ckeditor5-vue?branch=master)
[![Coverage Status](https://codecov.io/github/ckeditor/ckeditor5-vue/badge.svg)](https://codecov.io/github/ckeditor/ckeditor5-vue)
![Dependency Status](https://img.shields.io/librariesio/release/npm/@ckeditor/ckeditor5-vue)

⚠️ This repository contains the CKEditor 5 component for Vue.js `3+`. The component for lower Vue.js versions is located in another repository - [@ckeditor/ckeditor5-vue2](https://github.com/ckeditor/ckeditor5-vue2).

Official [CKEditor 5](https://ckeditor.com/ckeditor-5/) rich text editor component for Vue.js.

## [Developer Documentation](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html) 📖

See the ["Rich text editor component for Vue.js"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html) guide in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest) to learn more:

* [Quick start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#quick-start)
* [Using CKEditor 5 builder](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#using-ckeditor-5-builder)
* [Installing from npm](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#installing-from-npm)
* [Using component locally](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#using-the-component-locally)
* [Component directives](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#component-directives)
* [Component events](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/vuejs-v3.html#component-events)

## Contributing

> [!NOTE]
> This project requires **pnpm v10** or higher. You can check your version with `pnpm --version` and update if needed with `npm install -g pnpm@latest`.

After cloning this repository, install necessary dependencies:

```bash
pnpm install
```

### Running the development server

To manually test the editor integration, you can start the development server using one of the commands below:

```bash
pnpm run dev
```

### Executing tests

To test the editor integration against a set of automated tests, run the following command:

```bash
pnpm run test
```

If you want to run the tests in watch mode, use the following command:

```bash
pnpm run test:watch
```

### Building the package

To build the package that is ready to publish, use the following command:

```bash
pnpm run build
```

## Releasing package

### Prerequisites

CircleCI automates the release process and can release both channels: stable (`X.Y.Z`) and pre-releases (`X.Y.Z-alpha.X`, etc.).

Before you start, you need to prepare the changelog entries.

1. Make sure the `#master` branch is up-to-date: `git fetch && git checkout master && git pull`.
1. Prepare a release branch: `git checkout -b release-[YYYYMMDD]` where `YYYYMMDD` is the current day.
1. Generate the changelog entries: `pnpm run release:prepare-changelog`.
   * You can specify the release date by passing the `--date` option, e.g., `--date=2025-06-11`.
   * By passing the `--dry-run` option, you can check what the script will do without actually modifying the files.
   * Read all the entries, correct poor wording and other issues, wrap code names in backticks to format them, etc.
   * Add the missing `the/a` articles, `()` to method names, "it's" -> "its", etc.
   * A newly introduced feature should have just one changelog entry – something like "The initial implementation of the FOO feature." with a description of what it does.
1. Commit all changes and prepare a new pull request targeting the `#master` branch.
1. Ping the `@ckeditor/ckeditor-5-platform` team to review the pull request and trigger the release process.

## License

Licensed under a dual-license model, this software is available under:

* the [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html),
* or commercial license terms from CKSource Holding sp. z o.o.

For more information, see: [https://ckeditor.com/legal/ckeditor-licensing-options](https://ckeditor.com/legal/ckeditor-licensing-options).
