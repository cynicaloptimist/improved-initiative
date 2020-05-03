import React = require("react");
import { TagState } from "../../common/CombatantState";
import { Command } from "../Commands/Command";

export const CommandContext = React.createContext({
  SelectCombatant: (combatantId: string, appendSelection: boolean) => {},
  RemoveTagFromCombatant: (combatantId: string, tagState: TagState) => {},
  ApplyDamageToCombatant: (combatantId: string) => {},
  InlineCommands: [] as Command[]
});
