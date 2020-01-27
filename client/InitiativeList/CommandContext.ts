import React = require("react");
import { TagState } from "../../common/CombatantState";

export const CommandContext = React.createContext({
  SelectCombatant: (combatantId: string) => {},
  RemoveTagFromCombatant: (combatantId: string, tagState: TagState) => { },
});
