import { Command } from "./Command";
import { EncounterCommander } from "./EncounterCommander";

export const BuildEncounterCommandList = (
  c: EncounterCommander,
  saveEncounterFn: () => void
) => [
  new Command(
    "toggle-menu",
    "Toggle Menu",
    c.ToggleToolbarWidth,
    "alt+m",
    "bars",
    true,
    true
  ),
  new Command(
    "start-encounter",
    "Start Encounter",
    c.StartEncounter,
    "alt+r",
    "play"
  ),
  new Command(
    "reroll-initiative",
    "Reroll Initiative",
    c.RerollInitiative,
    "alt+shift+i",
    "sync",
    false
  ),
  new Command(
    "end-encounter",
    "End Encounter",
    c.EndEncounter,
    "shift+alt+r",
    "stop"
  ),
  new Command(
    "clear-encounter",
    "Clear Encounter",
    c.ClearEncounter,
    "alt+shift+del",
    "trash",
    false
  ),
  new Command(
    "clean-encounter",
    "Clean Encounter",
    c.CleanEncounter,
    "alt+del",
    "broom"
  ),
  new Command("open-library", "Open Library", c.ShowLibraries, "alt+a", "book"),
  new Command(
    "quick-add",
    "Quick Add Combatant",
    c.QuickAddStatBlock,
    "alt+q",
    "bolt",
    false
  ),
  new Command(
    "player-window",
    "Show Player Window",
    c.LaunchPlayerWindow,
    "alt+w",
    "users"
  ),
  new Command("next-turn", "Next Turn", c.NextTurn, "n", "step-forward"),
  new Command(
    "previous-turn",
    "Previous Turn",
    c.PreviousTurn,
    "alt+n",
    "step-backward",
    false
  ),
  new Command(
    "save-encounter",
    "Save Encounter",
    saveEncounterFn,
    "alt+s",
    "save"
  ),
  new Command("settings", "Settings", c.ShowSettings, "?", "cog", true, true)
];
