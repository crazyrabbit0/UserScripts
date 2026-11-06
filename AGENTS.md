# AGENTS.md

**Last audited:** 2026-11-06, commit `5240e70`, branch `master`.

Personal collection of browser userscripts (Tampermonkey / Violentmonkey / ScriptCat), published from `master` to GitHub, Greasy Fork and OpenUserJS. Remote: `https://github.com/crazyrabbit0/UserScripts`, single branch `master`, no build step.

## Layout

- `<Site> - <Feature>.user.js` at the root: one self-contained script per file, installed exactly as committed. `@name` equals the file name without `.user.js`.
- `README.md`: scripts table (version, sites, description, Install · Greasy Fork · OpenUserJS links). `CONTRIBUTING.md`: header template and change checklist.
- `.github/workflows/lint.yml`: on push to `master` and PRs, runs ESLint (`eslint.config.mjs`, browser + greasemonkey globals, `no-unused-vars` is a warning) and `.github/scripts/check-headers.mjs`.
- `.github/ISSUE_TEMPLATE/`: bug form (dropdown lists every script by name) and feature form; blank issues stay enabled for the scripts' `@supportURL` links.
- `.gitattributes` forces LF; `.gitignore` covers `.vscode` and `.omo/`.
- Flat repo: no `package.json`, no tests, no subdirectory AGENTS.md. Verification is ESLint, the header check and a manual run in a userscript manager on the matched site.

## Script map

| Script | `@run-at` | How it works |
|---|---|---|
| Distill - Simulate Tab Visibility | document-start | Redefines `document.hidden`/`visibilityState`, fakes rAF with `setTimeout`, restores originals on the first real `visibilitychange`. |
| MEGA TV - Episode Navigation | document-idle | `fetch`es the show page (same-origin) to find neighbour episodes; injects buttons + Left/Right keys. Logs with `[mega-prevnext]`. |
| Narto Drama - Bypass Ads | document-start | Intercepts the premium check and spoofs VIP status. |
| YouTube Music - Mark All Podcast Episodes as Played | document-start | `MutationObserver` waits for the podcast list, then adds a button that clicks through unplayed episodes. |
| YouTube Playlist AutoPlay | document-start | Polls until player elements exist, then `MutationObserver`s on progress/ended to advance the playlist. |
| YouTube Remove Important Notifications | document-start | Debounced `MutationObserver` on the notification panel re-sorts items chronologically. |

All use `@grant none` and an IIFE; none use `GM_*`, `unsafeWindow` or `@require`.

## Header rules

- Required keys (CI fails without them): `@name`, `@namespace https://github.com/crazyrabbit0`, `@version`, `@description`, `@author CrazyRabbit`, `@match`, `@grant`, `@license GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt`, `@copyright <year>+, CrazyRabbit (https://github.com/crazyrabbit0)`, `@homepageURL`, `@supportURL`, `@downloadURL`, `@updateURL`. Add `@icon` (Google favicon service) too.
- `@downloadURL`/`@updateURL` are `https://github.com/crazyrabbit0/UserScripts/raw/master/<encodeURIComponent(file name)>`; CI checks they point at their own file. `@supportURL` is the prefilled `issues/new?...&title=<encoded name>%20-%20Issue` link.
- Copy the full template from `CONTRIBUTING.md`; follow the key order of the newest scripts.
- Header value column differs by age: newer scripts (Distill, MEGA TV, Narto) align values at column 18 (`// @name         `), the YouTube ones at column 21. Match the file you edit; don't realign untouched headers.
- Code indent also differs (2 spaces in Distill/MEGA TV, 4 elsewhere); keep each file's own style, no repo-wide formatter.

## Changing or adding a script

1. Bump `@version` on every change; managers and both mirror sites only update when it increases.
2. Keep the README row in sync (version, sites, description). A new script needs a README row and a new option in `.github/ISSUE_TEMPLATE/bug_report.yml`.
3. Check locally from a temp copy so no `node_modules` lands in the repo: `npm install --no-save --no-package-lock eslint@9 @eslint/js@9 globals@16`, `npx eslint "*.user.js"`, `node .github/scripts/check-headers.mjs`.
4. Commit style: Conventional Commits with a scope per script, e.g. `feat(megatv): ...`, `docs: ...`, `ci: ...`. One script per commit.
5. After a push, confirm the Lint run: `gh run list -R crazyrabbit0/UserScripts --commit <sha>`.

## Publishing

- **Existing scripts update everywhere on push:** GitHub webhooks to Greasy Fork (`greasyfork.org/en/users/1223018-crazyrabbit0/webhook`) and OpenUserJS (`openuserjs.org/github/hook`) are active since 2023, and Greasy Fork also polls each script's sync URL.
- **A new script must be imported once on each site** (account `crazyrabbit0` on both):
  - Greasy Fork: `https://greasyfork.org/en/import`, paste the raw GitHub URL, language JavaScript, sync type Automatic.
  - OpenUserJS: `https://openuserjs.org/user/add/scripts` → Import Script from GitHub → `crazyrabbit0/UserScripts` → Import on the file. Page URL is `https://openuserjs.org/scripts/crazyrabbit0/<name with spaces as _>`.
  - Both need the user's login: drive the user's own Chrome with the `browserskill` skill (signed in to both sites as of 2026-11-06), or a Playwright window where the user signs in (see the `headed-login` skill).
- Then add both links to the script's README row.

## Gotchas

- `@description` may contain non-ASCII (Greek in the MEGA TV script); edit with the Edit/Write tools, not PowerShell 5 string handling, which mangles BOM-less UTF-8.
- Working-tree `.user.js` files may show `w/crlf` (`core.autocrlf=true`) while the index is LF; `.gitattributes` normalizes on add, so `git ls-files --eol` must show `i/lf` before committing.
- `check-headers.mjs` reads only the first value of each key and only `.user.js` files in the repo root; a script in a subfolder is silently skipped.
- The global `one-line-comments` plugin exempts `*.user.js`, since userscript headers are stacked `// @key` lines by design.
- Narto Drama - Bypass Ads circumvents a site's ad gate; Greasy Fork allows it only because its description says so plainly. Keep descriptions accurate.
