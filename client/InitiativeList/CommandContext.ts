import React = require("react");
import { TagState } from "../../common/CombatantState";

export const CommandContext = React.createContext({
  SelectCombatant: (combatandId: string) => {},
  RemoveTagFromCombatant: (combatandId: string, tagState: TagState) => {}
});
