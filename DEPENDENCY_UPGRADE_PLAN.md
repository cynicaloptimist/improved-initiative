# Dependency Security Upgrade Plan

Last reviewed: 2026-07-17

## Current state

The initial `npm audit` reported 56 vulnerabilities: 4 critical, 32 high,
16 moderate, and 4 low. A non-forced `npm audit fix` and removal of the unused
`ip` and `patreon` packages reduced that to 36 vulnerabilities: 2 critical,
13 high, 18 moderate, and 3 low.

The remaining findings need dependency replacement, major-version upgrades, or
changes to legacy build and test infrastructure. Do not use
`npm audit fix --force`: npm currently proposes several package downgrades as
"fixes", including old Grunt and Patreon releases.

## Completed package cleanup

The audited change set also reduces the installed tree from 1,892 to 1,852
packages and removes 13 unnecessary direct dependency entries:

- Removed unused `ip`, `patreon`, and `requirejs` packages.
- Removed the redundant direct `mustache@2` dependency; `mustache-express`
  already brings its required `mustache@4` version.
- Replaced direct `body-parser` calls with Express's built-in `json` and
  `urlencoded` middleware.
- Replaced deprecated `raw-loader` with webpack 5's built-in `asset/source`
  module type.
- Removed unused `webpack-cli` and stopped directly pinning `ajv` and
  `uglify-js`; the tools that need the latter two still declare them
  transitively.
- Removed obsolete or redundant `@types/file-saver`, `@types/mongodb`,
  `@types/mongodb-memory-server`, and `@types/body-parser` entries. The MongoDB
  packages and Express provide the types used by this project.

## Completed runtime upgrade

The supported runtime baseline is now Node.js 24 and npm 11. A clean install,
the full Jest suite, the production build, and a development workflow smoke
test passed on Node.js 24. The lockfile's dependency engine declarations did
not identify any packages that block Node.js 24.

The obsolete experimental Docker configuration and unused Travis CI
configuration were removed. GitHub Actions now validates Node.js 24.

## Priority 1: replace `request`

`request` is deprecated and accounts for both remaining critical findings, as
well as transitive findings in `form-data`, `qs`, `tough-cookie`, and `uuid`.
It is used by the remote encounter import route and Patreon news updates.

1. Replace the calls in `server/configureImportRoutes.ts` and
   `server/patreon.ts` with the already-installed Axios client.
2. Remove the unused `request` import from `server/routes.ts`.
3. Preserve timeouts, error handling, response status checks, and the 1 MB
   response limit. Enforce the size limit while streaming or before buffering,
   rather than only after the full response has been read.
4. Treat `/encounterfrom/` as an SSRF-sensitive endpoint. Permit only `http:`
   and `https:`, reject credentials and local/private/link-local destinations,
   and repeat validation after redirects.
5. Add route tests for valid imports, malformed JSON, oversized responses,
   non-success status codes, redirects, timeouts, and blocked private targets.
6. Exercise Patreon news refresh with a mocked success, invalid response, and
   network failure. Then remove `request` and `@types/request`.

Validation: run the server tests and production build, then manually import an
encounter from an allowed public URL and verify the Patreon news fallback and
refresh paths.

## Priority 2: replace `express-socket.io-session`

`express-socket.io-session` is unmaintained and pins vulnerable cookie parsing
packages with no available fix. This code carries login and paid-feature state
into Socket.IO, so it needs focused behavior validation.

1. Replace the wrapper with the supported Express session middleware pattern
   for the installed Socket.IO version.
2. Add integration tests proving a socket sees the same session as HTTP,
   anonymous sockets remain anonymous, and reconnects preserve session state.
3. Verify Epic/Mythic feature enforcement, custom encounter IDs, Player View
   joins, Redis-adapter operation, and session expiration.
4. Remove `express-socket.io-session` after the compatibility tests pass.

## Priority 3: modernize the in-memory MongoDB path

`mongodb-memory-server` is used by database tests and as the no-connection-string
development fallback. The audited fix is version 11, a major upgrade that must
be coordinated with the supported Node and MongoDB driver versions.

1. Decide whether the in-memory server should remain a runtime dependency or
   become a development-only service selected before server startup.
2. Upgrade `mongodb-memory-server` on the supported Node.js 24 runtime.
3. Upgrade it in isolation and update its startup API, binary-cache settings,
   and shutdown lifecycle as needed.
4. Run all database tests from a clean cache and test both an explicit
   `DB_CONNECTION_STRING` and the development fallback.

## Priority 4: retire vulnerable legacy build and test chains

Handle these as small, separate changes so build regressions are attributable:

- Replace `grunt-ts` with direct `tsc` invocation for the server build. This
  removes old `chokidar`, `lodash`, `xml2js`, and `js-yaml` dependency paths.
- Replace `markdown-loader-jest` with a small local Jest transformer for
  Markdown fixtures. This removes the obsolete `html-loader`/`html-minifier`
  and old `marked` chain.
- Upgrade Jest, `ts-jest`, and `jest-environment-jsdom` as one compatibility
  set, then assess whether `node-notifier`/`uuid` findings remain.
- Remove `webpack-build-notifier` if desktop build notifications are no longer
  required; otherwise replace or upgrade it only after testing watch mode.
- Re-audit `grunt-contrib-watch` after the TypeScript build migration. Avoid
  npm's suggested downgrade to `grunt-contrib-watch@0.4.4`.

## Additional package retirement opportunities

These packages are old, but replacing them needs focused browser or behavior
coverage before removal:

- Replace `browser-filesaver` with a small download helper based on `Blob`, an
  object URL, and an anchor's `download` attribute. First decide the minimum
  supported browser set, then verify JSON exports in Chrome, Firefox, and
  Safari and ensure object URLs are revoked.
- Replace `react-string-replace-recursively` with a typed local helper. Add
  tests for replacement priority, overlapping dice/spell/condition matches,
  ignored recursive matchers, React keys, and editable counters before
  removing the package and its four small Lodash dependencies.
- Replace Moment incrementally with `Date`/`Intl` or small local duration
  helpers. Audit stored timestamp parsing and display output first; date
  behavior appears in persisted-library and combat-timer paths.
- Migrate the remaining Enzyme tests to Testing Library when React is upgraded.
  Removing Enzyme now would combine a test rewrite with React 16 compatibility
  work.
- Consider replacing `mustache-express` with a minimal maintained render
  adapter, but validate template caching and every landing/tracker/Player View
  render path first.
- Consider consolidating `redis` and `ioredis` only as a dedicated change. Both
  are currently used in distinct session, Player View, and Socket.IO paths, so
  this is not a safe dependency-only cleanup.

Separately, move Testing Library packages and type-only packages that are
currently under `dependencies` into `devDependencies`. That will make
production installs smaller, though it will not remove them from development.

For each change, run the full Jest suite, `npm run lint`, `npm run build`, and a
short `npm run dev` smoke test that confirms client rebuild, server restart, and
CSS reload behavior.

## Completion criteria

- `npm audit --omit=dev` has no critical or high findings.
- Remaining development-only findings have documented, non-user-controlled
  exposure or are removed.
- The full test suite and production build pass on the repository's supported
  Node/npm versions.
- Encounter import, Patreon login/news, authenticated Player View sockets,
  Redis-backed sockets, and database fallback behavior have focused coverage.
