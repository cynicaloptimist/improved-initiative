import React = require("react");
import { TagState } from "../../common/CombatantState";
import { Command } from "../Commands/Command";

export const CommandContext = React.createContext({
  SelectCombatant: (combatantId: string) => {},
  RemoveTagFromCombatant: (combatantId: string, tagState: TagState) => {},
  EnrichText: (text: string) => <React.Fragment>text</React.Fragment>,
  InlineCommands: [] as Command[]
});
