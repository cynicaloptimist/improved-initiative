# AGENTS.md

## Project Context

Improved Initiative is an open-source, freemium combat tracker for D&D 5th
Edition. It helps dungeon masters run combat by tracking initiative order,
combatant statblocks, HP, tags/conditions, player view state, encounters, and
related combat workflow.

The app is not trying to become a full virtual tabletop. It is designed to
complement a real tabletop battlemap, especially for in-person play. Optimize
for busy DMs operating mid-session: fast actions, low friction, readable combat
state, and minimal surprises matter more than broad platform scope.

The production app is https://www.improvedinitiative.app/. The project is
sustained by Patreon-backed premium features, so changes should respect the
free core experience while preserving paid-account behavior.

This is a long-lived codebase maintained since 2014. Favor careful,
incremental changes over broad rewrites.

## Architecture

- `client/`: frontend TypeScript. Legacy Knockout state still exists; newer UI
  should use React `.tsx` components when possible.
- `server/`: Node/Express TypeScript backend with a separate TypeScript build.
- `common/`: shared data structures used by client/server and persisted in
  localStorage or databases. Changes here must be additive and
  backward-compatible unless the user explicitly approves a migration plan.
- `lesscss/`: LESS styles compiled into versioned CSS.
- `public/`: static assets and compiled output targets.
- `test/` and `*.test.ts(x)`: existing tests. The top-level `npm test` script
  runs the client and server Jest projects.

## High-Risk Areas

Be especially cautious around:

- Creating, running, saving, and restoring encounters.
- Combat flow and initiative order.
- Monster/spell/import workflows.
- Saved encounters and localStorage/database compatibility.
- Player View behavior and settings.
- Patreon login, account sync, and Epic Initiative rewards.

Do not alter product functionality outside the specific scope of the user's
request.

## Knockout and React

The codebase is gradually moving away from KnockoutJS. Prefer React for new UI
when it fits the surrounding code.

When a request touches Knockout-heavy code, first assess whether removing or
replacing the relevant Knockout code would simplify the implementation. If so,
tell the user and suggest doing that as a separate commit before the requested
change. Do not bundle opportunistic Knockout removal into unrelated work without
explicit approval.

If dropping Knockout would be too complex for the task, lean toward small
compatibility adapters between Knockout and React. Existing adapter patterns
include `useSubscription` in `client/Combatant/linkComponentToObservables.tsx`.

## Development Commands

- Install dependencies: `npm install`
- Start the complete development workflow: `npm run dev`
- Build/watch dev assets only: `npm run dev:build`
- Start server: `npm run start`
- Production build: `npm run build`
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint-and-fix`

The complete dev workflow runs Express on port 3001 behind a BrowserSync proxy
at `http://localhost:3000`. It rebuilds assets, restarts the server after server
TypeScript changes, injects changed CSS, and reloads after client or HTML
changes. Open5e preloading is skipped in this workflow.

The dev server optionally reads repository-root `.env` settings. Shell
environment variables take precedence over `.env`, and `.env` takes precedence
over the defaults in `scripts/dev-server.cjs`. Keep `.env` untracked and update
`.env.example` when adding supported development settings.

When running inside Codex Desktop, `npm` may not be available on `PATH`. Use
the bundled Node executable reported by `codex_app.load_workspace_dependencies`
and invoke local binaries directly, for example:

- Lint a touched file: `node node_modules/eslint/bin/eslint.js client/Index.ts --ext .ts,.tsx`
- Run tests: `node node_modules/jest/bin/jest.js --projects client/jest.config.js server/jest.config.js --runInBand`
- Build: `node node_modules/grunt-cli/bin/grunt build_min`

The full build compiles the versioned client bundle in `public/js`, compiles the
server TypeScript, and compiles LESS. LESS imports Google Fonts, so sandboxed
network restrictions can block the first build attempt.

For local manual testing without binding to port 80, waiting on Open5e
preloads, or fighting cached static assets, start the server with:

`NODE_ENV=development PORT=3000 BASE_URL=http://localhost:3000 SKIP_OPEN5E_API=1 node server/server.js`

When Open5e behavior matters, omit `SKIP_OPEN5E_API` and set
`OPEN5E_API_LIMIT` to cap how many remote entries are cached during startup,
for example:

`NODE_ENV=development PORT=3000 BASE_URL=http://localhost:3000 OPEN5E_API_LIMIT=500 node server/server.js`

Then browse to `http://localhost:3000`.

When Codex starts a long-running local server, do not leave an untracked hidden
Node process. Prefer an attached terminal when available, or a visible terminal
window if the user needs to manage the process after Codex closes. If starting
a background or detached process, make the server write its own PID to
`.codex-runtime/dev-server.pid` and URL to `.codex-runtime/dev-server.url`,
report both to the user, and stop the process when it is no longer needed.
Do not rely on a detached hidden process without a PID file.

## Coding Guidelines

- Use TypeScript.
- Prefer existing patterns and local helpers over new abstractions.
- Keep changes scoped and incremental.
- Use existing LESS styling conventions for now. Styled components may be a
  future direction, but do not introduce them without explicit confirmation.
- Do not add new architectural elements, dependencies, build tools, databases,
  state-management systems, or frontend frameworks without explicit
  confirmation.
- Follow existing Prettier settings: 2 spaces, semicolons, double quotes,
  80-column print width, no trailing commas.
- Use whole words in names.
- Use PascalCase for type names and public methods.
- Use camelCase for local variables and private properties.
- Do not prefix interfaces with `I`.
- Do not add game content that is not covered by the Open Gaming License.

## Testing and Verification

Add or update focused tests when practical. `npm test` runs the current Jest
suite, though Codex Desktop may need the direct bundled-Node command above.

For TypeScript/TSX changes, run `npm run lint` when feasible. For behavior
touching high-risk workflows, prefer a focused manual verification plan in
addition to lint/build checks.

## Collaboration Expectations

- Call out backward-compatibility risks before editing persisted structures.
- Ask before widening scope into product behavior changes, premium feature
  changes, or architecture changes.
- Suggest useful architectural improvements, but wait for explicit confirmation
  before implementing them.
- Keep AGENTS.md updated as project conventions become clearer.
