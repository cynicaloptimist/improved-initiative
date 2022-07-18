import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { max, sortBy } from "lodash";
import { StatBlock } from "../../common/StatBlock";
import { DefaultRules } from "../Rules/Rules";

export function GetCombatantsSorted(
  encounterState: EncounterState<CombatantState>,
  stable = false
): CombatantState[] {
  return sortBy(
    encounterState.Combatants,
    getCombatantSortIteratees(encounterState, stable)
  );
}

function getCombatantSortIteratees(
  encounterState: EncounterState<CombatantState>,
  stable: boolean
): ((c: CombatantState) => number | string)[] {
  if (stable) {
    return [c => -c.Initiative];
  } else {
    return [
      c => -c.Initiative,
      c => -getGroupBonusForCombatant(encounterState, c),
      c => -computeInitiativeBonus(c.StatBlock),
      c => (StatBlock.IsPlayerCharacter(c.StatBlock) ? 0 : 1),
      c => c.InitiativeGroup,
      c => c.StatBlock.Name,
      c => c.IndexLabel
    ];
  }
}

function getGroupBonusForCombatant(
  encounterState: EncounterState<CombatantState>,
  combatant: CombatantState
) {
  const initiativeBonus = computeInitiativeBonus(combatant.StatBlock);
  if (!combatant.InitiativeGroup) {
    return initiativeBonus;
  }

  const groupBonuses = encounterState.Combatants.filter(
    c => c.InitiativeGroup == combatant.InitiativeGroup
  ).map(c => computeInitiativeBonus(c.StatBlock));

  return max(groupBonuses) || initiativeBonus;
}

function computeInitiativeBonus(statBlock: StatBlock) {
  const dexterityModifier = new DefaultRules().GetModifierFromScore(
    statBlock.Abilities.Dex
  );
  return dexterityModifier + (statBlock.InitiativeModifier || 0);
}
