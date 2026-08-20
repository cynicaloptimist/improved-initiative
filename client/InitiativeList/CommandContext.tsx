import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { Command } from "../Commands/Command";
import { Combatant } from "../Combatant/Combatant";

export const CommandContext = React.createContext({
  SelectCombatant: (combatantId: string, appendSelection: boolean) => {},
  RemoveTagFromCombatant: (combatantId: string, tagState: TagState) => {},
  ApplyDamageToCombatant: (combatantId: string) => {},
  ApplyManaToCombatant: (combatantId: string) => {},
  MoveCombatantFromDrag: (
    draggedCombatantId: string,
    droppedOntoCombatantId: string | null
  ) => {},
  SetCombatantColor: (combatantId: string, color: string) => {},
  ToggleCombatantSpentReaction: (combatantId: string) => {},
  CombatantsPendingRemove: [] as Combatant[],
  RestoreCombatants: () => {},
  FlushCombatants: () => {},
  CombatantCommands: [] as Command[]
});
