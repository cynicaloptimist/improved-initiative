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
- `test/` and `*.test.ts(x)`: existing tests. The current top-level `npm test`
  script is disabled due Node/Jest/ESM interoperability issues; getting tests
  working again is a project priority.

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
- Build/watch dev assets: `npx grunt` or `npm run dev`
- Start server: `npm run start`
- Production build: `npm run build`
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint-and-fix`

The dev server defaults to port 80 and is viewed at `http://localhost`.

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

The test suite needs repair. Until `npm test` is working again, add or update
focused tests when practical, but be clear about whether they can currently be
run through the normal script.

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
