# Client Bundle Size Findings

Date: 2026-09-03

## Summary

The production client is currently emitted as one bundle that serves three
mutually exclusive pages: the tracker, Player View, and the landing page. The
most valuable first change is to replace that single static dependency graph
with a small page dispatcher that asynchronously loads the application needed
by the current page.

An analysis-only build indicates that page-level loading, combined with
preserving ES modules for Webpack tree-shaking, could reduce initial compressed
JavaScript substantially:

| Page | Current gzip | Estimated gzip | Estimated reduction |
| --- | ---: | ---: | ---: |
| Tracker | 500 KiB | approximately 395 KiB | 21% |
| Player View | 500 KiB | approximately 226 KiB | 55% |
| Landing | 500 KiB | approximately 131 KiB | 74% |

The estimates were produced from the current dependency graph with temporary
analysis entries. They are directional rather than committed performance
budgets and should be remeasured from the implemented build.

## Current Baseline

The current production build emits:

| Asset | Raw | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| `ImprovedInitiative.3.17.2.js` | 1.75 MiB | 500 KiB | 408 KiB |

Webpack consequently reports its asset-size, entrypoint-size, and performance
recommendation warnings.

The bundle structure is responsible for much of the unnecessary page cost:

- `webpack.config.base.js` defines only `client/Index.ts` as an entry.
- `client/Index.ts` statically imports tracker, Player View, and landing code.
- `html/tracker.html`, `html/playerview.html`, and `html/landing.html` all load
  the same versioned JavaScript asset.
- Runtime DOM checks choose the active application only after all three
  applications and their dependencies have already been downloaded and
  parsed.

Large contributors in the pre-minification module graph include:

| Module or package | Approximate source size |
| --- | ---: |
| `@sentry/browser` and included modules | 1,030 KiB |
| `lodash` | 533 KiB |
| `react-markdown` and included modules | 386 KiB |
| `msgpack5` | 212 KiB |
| `react-color` and included modules | 210 KiB |
| `moment` | 171 KiB |

These source sizes overlap with concatenated chunks and are not additive
transfer-size estimates. They identify dependency areas worth investigating.

## Recommended Async Boundaries

### 1. Page-level application dispatch

This is the highest-value boundary.

Split the current `window.onload` work into page-specific boot modules, such as:

- `bootstrapTracker`
- `bootstrapPlayerView`
- `bootstrapLanding`

Keep a small entry script that waits for the document to load, detects the
existing page marker, and dynamically imports only the corresponding boot
module. Shared async chunks can then be cached and reused when a user moves
from the landing page to the tracker.

The boot functions should own their page-specific initialization. For example,
Player View should not initialize tracker settings or Knockout binding handlers
unless a verified dependency requires them.

### 2. Legacy URL decompression

`client/TrackerViewModel.tsx` statically imports
`DecompressLegacyUrlPayload`, which brings in LZMA, MessagePack, and URL-safe
Base64 support for every tracker visit. It is used only when a legacy `?s=` URL
payload is present.

Importing the decompressor inside that existing asynchronous branch is a clean,
low-risk boundary. The analysis indicates an ordinary tracker startup saving
of approximately 34 KiB gzip.

The modern `?i=` path uses `lz-string` separately and should retain its current
behavior.

### 3. Combatant color picker

`client/InitiativeList/CombatantRow.tsx` statically imports `SketchPicker` from
`react-color`. The picker is needed only after a user opens a combatant's color
control.

A lazy picker component loaded when the popup is opened would remove
approximately 35 KiB gzip from initial tracker loading. The closed control can
continue displaying the existing color indicator without this dependency.

### 4. Secondary React surfaces

Settings, the Library Manager, and the stat-block and spell editors are natural
interaction boundaries, but their isolated savings are smaller because their
large dependencies are also used elsewhere in the tracker.

Measured isolated estimates were:

| Boundary | Approximate initial gzip saving |
| --- | ---: |
| Settings | 10 KiB |
| Stat-block and spell editors | 5 KiB |
| Library Manager | 4 KiB |

These are reasonable follow-up changes after page dispatch, legacy
decompression, and the color picker. Each lazy React surface will need an
appropriate `Suspense` fallback that does not disrupt mid-session actions.

## Build Prerequisites

`client/tsconfig.json` currently emits CommonJS. TypeScript can transform
dynamic imports under CommonJS before Webpack sees them, and CommonJS also
limits tree-shaking. The client Webpack build should preserve ES modules.

One contained approach is:

1. Add a Webpack-specific client TypeScript configuration that emits ESNext
   modules and uses Node module resolution.
2. Keep the Jest configuration emitting CommonJS.
3. Point `ts-loader` at the Webpack-specific configuration.
4. Convert the four current TypeScript import-assignment declarations that are
   incompatible with ES-module output:
   - `client/InitiativeList/RestoreCombatants.tsx`
   - `client/Library/FilterCache.ts`
   - `client/PlayerView/PlayerViewClient.ts`
   - `client/Library/Manager/ListingSelectionContext.ts`

Preserving ES modules also lets Webpack discard unused Sentry exports. In the
analysis build, narrowing the Sentry surface reduced each page by approximately
75 KiB gzip without delaying error monitoring.

## Supporting Dependency Seams

These changes are not all async UI boundaries, but they prevent page-specific
chunks from inheriting avoidable tracker dependencies.

### Sentry

`client/Environment.ts` and `client/Encounter/Encounter.ts` import the complete
Sentry namespace while using only `init`, `captureException`, and
`captureMessage`.

Prefer ES-module tree-shaking or narrow named imports. Deferring Sentry
initialization entirely is less attractive because it can lose errors during
startup.

### Metrics and storage

`client/Utility/Metrics.ts` statically imports `Store` even though storage is
needed only by the asynchronous `TrackLoad` method. This pulls LocalForage and
the D&D app importer toward pages that only record lightweight events.

Loading the storage-dependent code inside `TrackLoad`, or separating tracker
load metrics from general event metrics, would reduce coupling. The tracker
currently calls `TrackLoad` after its initial React render, so this work can be
deferred without blocking that render.

### Settings and command bindings

The settings module combines persisted settings, dark-mode application,
Mousetrap command binding, Lodash-based migration, and Knockout state. Landing
needs only a subset of this behavior.

Separating basic settings initialization and dark-mode application from
tracker command binding would keep Mousetrap and unrelated migration code out
of lightweight pages.

### Landing page Knockout

The landing page uses a small Knockout view model for an input and two actions.
Removing that contained Knockout surface would simplify a lightweight landing
entry and reduce its dependency graph. In accordance with the repository's
Knockout migration policy, this should be a separate commit rather than being
bundled opportunistically with build configuration changes.

### Lodash and Moment

Both dependencies are used throughout core tracker paths, so they are poor
async boundaries. Whole-Lodash namespace imports and simple `moment.now()`
calls are nevertheless good candidates for incremental dependency cleanup.
Those changes should be measured independently and should not expand the first
code-splitting slice.

## Deployment and Runtime Requirements

Async loading introduces correctness concerns beyond bundle configuration:

- Use content-hashed async chunk filenames.
- Set or verify the Webpack public path for `/js/` assets.
- Preserve the existing versioned bootstrap filename referenced by the HTML
  templates.
- Retain old hashed chunks for at least the static asset cache lifetime, or
  provide a controlled reload path for `ChunkLoadError`.
- Account for long-running combat sessions that may request a lazy chunk after
  a deployment has replaced the server assets.
- Show an intentional loading state for page boot and lazy React surfaces.
- Provide a useful error state or reload action if a chunk cannot be fetched.

The server currently gives static assets a seven-day cache lifetime. Content
hashes solve stale-content correctness for new pages, but do not by themselves
protect a page that was opened before deployment and requests an old lazy chunk
after deployment.

## Warning Policy

Webpack's default 244 KiB asset warning is a heuristic, not a route-level
performance budget. Setting `splitChunks.maxSize` low enough to silence the
warning mechanically fragmented the tracker prototype into 27 requests. That
is not a desirable first solution.

After meaningful async boundaries are implemented, define budgets around:

- initial compressed bytes for each page;
- number of initial requests;
- largest optional interaction chunk;
- repeat navigation from landing to tracker with shared chunks cached.

Webpack's performance thresholds can then be adjusted to reflect those budgets
rather than merely suppressing the current warning.

## Suggested Implementation Order

1. Add repeatable bundle measurement and record the current baseline.
2. Preserve ES modules in the Webpack TypeScript build and verify the existing
   Jest CommonJS path.
3. Introduce the page dispatcher and page-specific boot modules.
4. Add content-hashed chunk output, public-path configuration, and chunk-load
   failure handling.
5. Lazy-load legacy URL decompression.
6. Lazy-load the combatant color picker.
7. Reassess Settings, editors, and Library Manager using the new chunk graph.
8. Consider separate landing Knockout removal and dependency-hygiene commits.

## Verification

At minimum, implementation should verify:

- production build output and compressed page totals;
- landing start and join actions;
- tracker startup, autosave restoration, and imported encounter startup;
- Player View initial fetch and socket updates;
- modern and legacy URL imports;
- opening and changing a combatant color;
- settings, Library Manager, stat-block editor, and spell editor loading;
- behavior when an async chunk request fails;
- a page left open across a simulated deployment;
- the focused Jest suite, lint, production build, and Playwright coverage.
