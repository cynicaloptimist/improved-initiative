# Dependency Security Upgrade Plan

Last reviewed: 2026-09-03

## Current state

The initial `npm audit` reported 56 vulnerabilities: 4 critical, 32 high,
16 moderate, and 4 low. The validated dependency updates and package removals
reduced that to 32 vulnerabilities: 0 critical, 13 high, 16 moderate, and
3 low. Replacing the obsolete Socket.IO session bridge and upgrading the
in-memory MongoDB path reduced that further to 27 vulnerabilities: 0 critical,
13 high, 14 moderate, and 0 low. The production-only audit reports no
vulnerabilities.

The remaining findings need dependency replacement, major-version upgrades, or
changes to legacy build and test infrastructure. Do not use
`npm audit fix --force`: npm currently proposes several package downgrades as
"fixes", including old Grunt and Patreon releases.

## Completed package cleanup

The audited change set also reduces the installed tree from 1,892 to 1,816
packages and removes 16 unnecessary direct dependency entries:

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
- Replaced deprecated `request` with the existing Axios client and removed
  `request`, `@types/request`, and 35 packages from its obsolete dependency
  chain.

## Completed runtime upgrade

The supported runtime baseline is now Node.js 24 and npm 11. A clean install,
the full Jest suite, the production build, and a development workflow smoke
test passed on Node.js 24. The lockfile's dependency engine declarations did
not identify any packages that block Node.js 24.

The obsolete experimental Docker configuration and unused Travis CI
configuration were removed. GitHub Actions now validates Node.js 24.

Upgrade `@types/node` from 12 to 24 as a separate type-checking change. The old
definitions do not block execution, but they hide current runtime APIs and may
expose compile work when upgraded.

## Completed: replace `request`

`request` accounted for the remaining critical findings and transitive findings
in `form-data`, `qs`, and `tough-cookie`. A bounded Axios text-fetching prototype
removed that chain and passed automated validation, but its custom IP, DNS, and
redirect security implementation should not be maintained in this repository.

The prototype now uses `request-filtering-agent` for private, reserved, and
link-local address filtering, including DNS rebinding protection. The local
wrapper retains only application policy: a 10-second timeout, 1 MB response
limit, standard-port enforcement on every redirect, HTTP status handling,
redirect and concurrency limits, and safe route errors.

Manual validation confirmed public encounter imports, rejected invalid and
private targets, and the Patreon news fallback behavior.

## Completed: replace `express-socket.io-session`

`express-socket.io-session` is unmaintained and pins vulnerable cookie parsing
packages with no available fix. This code carries login and paid-feature state
into Socket.IO, so it needs focused behavior validation.

The wrapper has been replaced with Socket.IO's supported
`io.engine.use(sessionMiddleware)` integration. Integration tests prove a
socket sees the same session as HTTP, anonymous sockets remain anonymous,
reconnects preserve paid access, custom encounter IDs enforce Epic access, and
removing the stored session revokes access. The package and five now-unneeded
transitive dependencies have been removed.

Local manual validation confirmed normal and Epic encounter updates, Player
View joins, and custom encounter IDs. A Redis-backed deployment was not
manually exercised, but the replacement does not change the Redis adapter:
Express sessions are still loaded from the shared Redis session store during
each socket handshake, while the adapter only forwards socket broadcasts.
Redis reconnection and startup hardening remain separate follow-up work.

## Completed: modernize the in-memory MongoDB path

`mongodb-memory-server` is used by database tests and as the no-connection-string
development fallback. It has been upgraded from version 7.6 to 11.2 on the
supported Node.js 24 runtime. Its existing `create`, `getUri`, and `stop`
lifecycle remains compatible, so no application code changes were required.

The default MongoDB 8.2.6 binary downloaded and passed all 15 focused database
tests. The full Jest suite and production build also pass. Production continues
to use its explicit `DB_CONNECTION_STRING`; the in-memory fallback remains a
runtime dependency because it is imported by the server when that setting is
absent.

## Completed: reduce build warnings and cache production builds

The September 2026 warning audit traced nine install-time deprecations to four
roots. The low-risk build-tool and compatibility changes reduced that to one
development-only warning:

- Replaced `grunt-ts` with a direct call to the existing TypeScript compiler.
  This removed the deprecated Chokidar 2, fsevents 1, and old source-map helper
  chain without changing the server `tsconfig` or watch task.
- Upgraded `ts-loader` from 6.2 to 9.6. This removed both webpack API
  deprecation warnings while retaining full type checking.
- Upgraded `webpack-build-notifier` from 2.3 to 3.1 and constrained its
  `node-notifier` UUID implementation to the supported CommonJS-compatible
  UUID 11 line.
- Renamed Prettier's deprecated `jsxBracketSameLine` configuration key to
  `bracketSameLine` without changing its value.
- Excluded Moment's unused locale context from the production bundle. The
  client does not select a Moment locale, so its built-in English behavior is
  unchanged. This reduced the minified production asset from 1.97 MiB to 1.75
  MiB.
- Replaced the broad `json-url` wrapper with its three existing LZMA,
  MessagePack, and URL-safe Base64 decoding primitives. This removes the
  obsolete `core-js@2` Babel runtime and unused codecs. A fixture generated by
  `json-url@2` verifies that existing version-1 shared links still decode.

The production webpack path now uses webpack directly because
`grunt-webpack@5` disables webpack's configured filesystem cache for non-watch
builds. On the audited machine, a no-change webpack rebuild fell from about
19.4 seconds to 0.6 seconds. The complete cached production build, including
Grunt startup, server TypeScript, and LESS, finished in about 4 seconds.

The remaining install deprecation is `whatwg-encoding` under
`jest-environment-jsdom`. Handle that with the Jest compatibility set rather
than overriding jsdom internals. npm may also report unknown `user` and
`unsafe-perm` settings when they are present in a developer's user-level npm
configuration; those are not repository settings.

Webpack still reports three performance warnings because the production entry
point is substantially larger than 244 KiB. These are valid
application-performance signals, not stale tooling warnings, so they remain
visible. Address them through measured code splitting or dependency retirement
rather than raising or disabling the size threshold.

## Priority 4: retire vulnerable legacy build and test chains

Handle these as small, separate changes so build regressions are attributable:

- Replace `markdown-loader-jest` with a small local Jest transformer for
  Markdown fixtures. This removes the obsolete `html-loader`/`html-minifier`
  and old `marked` chain.
- Upgrade Jest, `ts-jest`, and `jest-environment-jsdom` as one compatibility
  set, then assess whether `node-notifier`/`uuid` findings remain.

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
