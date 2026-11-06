# Contributing

Thanks for helping out. Bug reports and feature ideas go in [issues](https://github.com/crazyrabbit0/UserScripts/issues/new/choose); code changes go in pull requests.

## Script layout

- One script per file, named `<Site> - <Feature>.user.js` at the repository root. The `@name` matches the file name without `.user.js`.
- No build step and no dependencies: each file is installed exactly as committed.
- Plain modern JavaScript, wrapped in an IIFE, with `@grant none` unless a `GM_*` API is really needed.

## Required header

Every script's `==UserScript==` block contains these keys, in this order where they apply:

```js
// ==UserScript==
// @name         <Site> - <Feature>
// @namespace    https://github.com/crazyrabbit0
// @version      1.0
// @description  One sentence on what the script does
// @author       CrazyRabbit
// @match        https://example.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=example.com
// @grant        none
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright    <year>+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL  https://github.com/crazyrabbit0/UserScripts
// @supportURL   https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=<URL-encoded name>%20-%20Issue
// @downloadURL  https://github.com/crazyrabbit0/UserScripts/raw/master/<URL-encoded file name>
// @updateURL    https://github.com/crazyrabbit0/UserScripts/raw/master/<URL-encoded file name>
// @run-at       document-start
// ==/UserScript==
```

The CI check (`.github/scripts/check-headers.mjs`) fails when a required key is missing, `@name` does not match the file name, or `@downloadURL`/`@updateURL` point to a different file.

## Changing a script

1. Bump `@version` in every change; userscript managers only update installed copies when it increases.
2. Test the script in Tampermonkey or Violentmonkey on the sites it matches.
3. Update the script's row in the [README](README.md) table when its version, sites or behaviour change, and add a row for a new script. The maintainer imports new scripts into [Greasy Fork](https://greasyfork.org/en/import) and [OpenUserJS](https://openuserjs.org/user/add/scripts) and adds both links to that row; existing scripts on both sites update from GitHub on every push.
4. Run the checks locally before opening the pull request:

```sh
npm install --no-save eslint@9 globals@16
npx eslint "*.user.js"
node .github/scripts/check-headers.mjs
```

## License

By contributing you agree that your changes are licensed under [GPL-3.0-or-later](LICENSE).
