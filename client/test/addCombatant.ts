import { StatBlock } from "../../common/StatBlock";
import { Combatant } from "../Combatant/Combatant";
import { VariantMaximumHP } from "../Combatant/GetOrRollMaximumHP";
import { Encounter } from "../Encounter/Encounter";

export function addCombatantFromStatBlock(
  encounter: Encounter,
  statBlock: Record<string, unknown> = StatBlock.Default(),
  hideOnAdd = false,
  variantMaximumHP: VariantMaximumHP = VariantMaximumHP.DEFAULT
): Combatant {
  encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd, variantMaximumHP);
  return encounter.Combatants()[encounter.Combatants().length - 1];
}
