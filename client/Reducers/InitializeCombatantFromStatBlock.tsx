import { CombatantState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";

export function InitializeCombatantFromStatBlock(
  statBlock: StatBlock,
  combatantId: string,
  rolledHP?: number
): CombatantState {
  return {
    StatBlock: statBlock,
    Id: combatantId,
    Alias: "",
    CurrentHP: rolledHP ?? statBlock.HP.Value,
    TemporaryHP: 0,
    Initiative: 0,
    IndexLabel: 0,
    Hidden: false,
    RevealedAC: false,
    Tags: [],
    InterfaceVersion: process.env.VERSION || "unknown"
  };
}
