# Mana Tracking Plan

Goal: add a "Mana" resource that behaves like Hit Points — trackable per-combatant
during combat, with a max value on the stat block and a current value that goes up
and down during an encounter, shown in the UI wherever HP already shows.

## How HP actually works (for reference)

HP isn't one field — it's a template value plus a separate combat-instance value,
wired through four layers:

1. **Template (max/base)**: `StatBlock.HP: { Value: number; Notes: string }`
   (`common/StatBlock.ts`) — the reusable creature/character definition.
2. **Combat instance (current)**: `CombatantState.CurrentHP` and `.TemporaryHP`
   (`common/CombatantState.ts`) — per-encounter, persisted separately from the
   template. `Combatant.ts` holds these as Knockout observables (`CurrentHP`,
   `TemporaryHP`), and derives `MaxHP` live from the current StatBlock rather than
   storing it twice.
3. **Prompts/commands**: `ApplyDamagePrompt.tsx` / `ApplyHealingPrompt.tsx` /
   `ApplyTemporaryHPPrompt.tsx` (UI) → `CombatantCommander` methods (`ApplyDamage`,
   `ApplyHealing`, `AddTemporaryHP`) → `Combatant.ApplyDamage`/`ApplyHealing`/
   `ApplyTemporaryHP` (the actual clamping/math) → `CombatantViewModel` wraps this
   for the React/Knockout bridge and fires concentration checks + event log entries.
4. **Display**: the initiative list row (colored HP cell + optional bar), the
   combatant detail panel ("Current HP"), the stat block display/editor (base HP),
   and Player View (HP hidden/shown/colored per a verbosity setting, since players
   shouldn't always see exact enemy HP).

`TemporaryHP` is the closest existing precedent for a second HP-like pool — it's
additive and absorbs damage first, though Mana more likely wants its own
independent current/max pool (closer to how CurrentHP+MaxHP works than how
TemporaryHP works).

## Decisions needed before implementing

1. **Does every stat block get Mana, or only some?** Not every Nimble creature/class
   necessarily uses mana. Recommend making it optional (`Mana?: { Value: number;
   Notes: string }` on `StatBlock`) so it can be omitted, with the UI only showing
   the Mana row/field when it's present — same idea as how `Speed` is now hidden
   when empty.
2. **How deep should this go on the first pass?** HP has a full stack: prompts,
   commands, keybindings, initiative-list click-to-edit, colored bars, Player View
   verbosity settings, event log entries. Suggest building this in phases (below)
   rather than the full stack at once — confirm which phase to stop at for now.
3. **Does Mana need a "temporary mana" equivalent?** (Skipping unless you want it —
   adds complexity for a mechanic that may not exist in Nimble.)
4. **Should current Mana persist across encounters for player characters**, the way
   `PersistentCharacter.CurrentHP` does? (Relevant if the same PC is reused in
   multiple fights in one session.)

## Proposed phases

### Phase 1 — Data model + stat block editor + template display only
No combat tracking yet, just defining and viewing max Mana on a stat block.
- `common/StatBlock.ts`: add `Mana?: ValueAndNotes` to `StatBlock`.
- `client/StatBlockEditor/StatBlockEditor.tsx`: add a `ValueAndNotesField`
  (already generic, used by HP/AC) for `fieldName="Mana"`.
- `client/Components/StatBlock.tsx`: show Mana in the stat block display panel
  (conditionally, only when `statBlock.Mana` is set), consistent with how
  HP/Defense/Speed are shown now.

### Phase 2 — Current Mana tracked per-combatant during an encounter
Makes Mana a real "goes up and down in combat" resource, not just a static number.
- `common/CombatantState.ts`: add `CurrentMana?: number`.
- `client/Combatant/Combatant.ts`: add `CurrentMana` observable, `MaxMana` computed
  (derived from StatBlock, like `MaxHP`), hydrate/serialize in
  `processCombatantState`/`GetState`.
- `client/Encounter/Encounter.ts` (`AddCombatantFromStatBlock`,
  `AddCombatantFromPersistentCharacter`) and
  `client/Reducers/InitializeCombatantFromStatBlock.tsx`: seed `CurrentMana` when a
  combatant is added.
- `client/Encounter/UpdateLegacySavedEncounter.ts`: default `CurrentMana` for
  encounters saved before this existed.
- `client/Combatant/CombatantDetails.tsx`: show "Current Mana" next to "Current HP"
  (still just a display, not yet editable via a dedicated prompt).

### Phase 3 — Spend/restore mechanics (the "apply damage" equivalent)
- `Combatant.ts`: `ApplySpendMana(amount)` / `ApplyRestoreMana(amount)`, clamped
  0..max (mirrors `ApplyDamage`/`ApplyHealing`).
- New prompt(s) modeled on `ApplyDamagePrompt.tsx`/`ApplyHealingPrompt.tsx`.
- `CombatantCommander.tsx`: `SpendMana`/`RestoreMana` methods enqueuing the prompt.
- `BuildCombatantCommandList.ts`: register as commands (toolbar/keybind/context
  menu), same pattern as "Apply Damage"/"Apply Healing".
- `EventLog`: log mana changes, same as `LogHPChange`.

### Phase 4 — Initiative list + Player View parity
Only worth doing once Phase 3 is confirmed useful in practice.
- `client/InitiativeList/CombatantRow.tsx`: a Mana cell (colored bar, click-to-spend)
  alongside the HP cell.
- Player View: `ToPlayerViewCombatantState.ts` + a Mana verbosity setting, mirroring
  `MonsterHPVerbosity`/`PlayerHPVerbosity`, if players should see (or not see) enemy
  mana.

## Recommendation

Start with **Phase 1** to confirm the field/label/shape feels right, then decide
whether to continue into Phase 2+. This matches how the ability-score and stat
label changes have gone so far — small, reviewable steps rather than the whole
stack at once.

## Review checklist

- [ ] Confirm Mana should be optional per stat block (not forced on every creature).
- [ ] Pick a stopping phase for the first implementation pass.
- [ ] Confirm/deny "temporary mana."
- [ ] Confirm/deny cross-encounter persistence for player characters.
- [ ] Any naming preference — "Mana", "MP", something else?
