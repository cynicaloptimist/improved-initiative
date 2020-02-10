import { Command } from "./Command";
import { EncounterCommander } from "./EncounterCommander";

export const BuildEncounterCommandList = (
  c: EncounterCommander,
  saveEncounterFn: () => void
) =>
  [
    new Command({
      id: "toggle-menu",
      description: "Toggle Wide Menu",
      actionBinding: c.ToggleToolbarWidth,
      defaultKeyBinding: "alt+m",
      fontAwesomeIcon: "chevron-right",
      lockOnActionBar: true
    }),
    new Command({
      id: "start-encounter",
      description: "Start Encounter",
      actionBinding: c.StartEncounter,
      defaultKeyBinding: "alt+r",
      fontAwesomeIcon: "play"
    }),
    new Command({
      id: "reroll-initiative",
      description: "Reroll Initiative",
      actionBinding: c.RerollInitiative,
      defaultKeyBinding: "alt+shift+i",
      fontAwesomeIcon: "sync",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "end-encounter",
      description: "End Encounter",
      actionBinding: c.EndEncounter,
      defaultKeyBinding: "shift+alt+r",
      fontAwesomeIcon: "stop"
    }),
    new Command({
      id: "clear-encounter",
      description: "Clear Encounter",
      actionBinding: c.ClearEncounter,
      defaultKeyBinding: "alt+shift+del",
      fontAwesomeIcon: "trash",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "clean-encounter",
      description: "Clean Encounter",
      actionBinding: c.CleanEncounter,
      defaultKeyBinding: "alt+del",
      fontAwesomeIcon: "broom"
    }),
    new Command({
      id: "open-library",
      description: "Open Library",
      actionBinding: c.ShowLibraries,
      defaultKeyBinding: "alt+a",
      fontAwesomeIcon: "book"
    }),
    new Command({
      id: "roll-dice",
      description: "Roll Dice",
      actionBinding: c.PromptRollDice,
      defaultKeyBinding: "d",
      fontAwesomeIcon: "dice",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "quick-add",
      description: "Quick Add Combatant",
      actionBinding: c.QuickAddStatBlock,
      defaultKeyBinding: "alt+q",
      fontAwesomeIcon: "bolt",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "restore-all-player-character-hp",
      description: "Restore all Player Character HP",
      actionBinding: c.RestoreAllPlayerCharacterHP,
      defaultKeyBinding: "alt+shift+t",
      fontAwesomeIcon: "clinic-medical",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "player-window",
      description: "Launch Player View",
      actionBinding: c.LaunchPlayerView,
      defaultKeyBinding: "alt+w",
      fontAwesomeIcon: "users"
    }),
    typeof document.documentElement.requestFullscreen == "function" &&
      new Command({
        id: "toggle-full-screen",
        description: "Toggle Full Screen",
        actionBinding: c.ToggleFullScreen,
        defaultKeyBinding: "f11",
        fontAwesomeIcon: "expand",
        defaultShowOnActionBar: false
      }),
    new Command({
      id: "next-turn",
      description: "Next Turn",
      actionBinding: c.NextTurn,
      defaultKeyBinding: "n",
      fontAwesomeIcon: "step-forward"
    }),
    new Command({
      id: "previous-turn",
      description: "Previous Turn",
      actionBinding: c.PreviousTurn,
      defaultKeyBinding: "alt+n",
      fontAwesomeIcon: "step-backward",
      defaultShowOnActionBar: false
    }),
    new Command({
      id: "save-encounter",
      description: "Save Encounter",
      actionBinding: saveEncounterFn,
      defaultKeyBinding: "alt+s",
      fontAwesomeIcon: "save"
    }),
    new Command({
      id: "settings",
      description: "Settings",
      actionBinding: c.ShowSettings,
      defaultKeyBinding: "?",
      fontAwesomeIcon: "cog",
      lockOnActionBar: true
    })
  ].filter(c => c) as Command[];
