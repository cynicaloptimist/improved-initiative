import { CombatantCommander } from "./CombatantCommander";
import { Command } from "./Command";

export const BuildCombatantCommandList: (
  c: CombatantCommander
) => Command[] = c => [
  new Command({
    id: "apply-damage",
    description: "Apply Damage",
    actionBinding: c.EditHP,
    defaultKeyBinding: "t",
    fontAwesomeIcon: "fist-raised"
  }),
  new Command({
    id: "apply-healing",
    description: "Apply Healing",
    actionBinding: c.ApplyHealing,
    defaultKeyBinding: "l",
    fontAwesomeIcon: "heart",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "apply-temporary-hp",
    description: "Apply Temporary HP",
    actionBinding: c.AddTemporaryHP,
    defaultKeyBinding: "alt+t",
    fontAwesomeIcon: "medkit",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "add-tag",
    description: "Add Tag",
    actionBinding: c.AddTag,
    defaultKeyBinding: "g",
    fontAwesomeIcon: "tag",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "update-notes",
    description: "Update Persistent Notes",
    actionBinding: c.UpdateNotes,
    defaultKeyBinding: "y",
    fontAwesomeIcon: "file-alt",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "remove",
    description: "Remove from Encounter",
    actionBinding: c.Remove,
    defaultKeyBinding: "del",
    fontAwesomeIcon: "times"
  }),
  new Command({
    id: "set-alias",
    description: "Rename",
    actionBinding: c.SetAlias,
    defaultKeyBinding: "f2",
    fontAwesomeIcon: "i-cursor"
  }),
  new Command({
    id: "toggle-hidden",
    description: "Hide/Reveal in Player View",
    actionBinding: c.ToggleHidden,
    defaultKeyBinding: "h",
    fontAwesomeIcon: "eye",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "toggle-reveal-ac",
    description: "Reveal/Hide AC in Player View",
    actionBinding: c.ToggleRevealedAC,
    defaultKeyBinding: "alt+h",
    fontAwesomeIcon: "shield-alt",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "edit-statblock",
    description: "Edit Unique Statblock",
    actionBinding: c.EditOwnStatBlock,
    defaultKeyBinding: "e",
    fontAwesomeIcon: "edit",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "set-initiative",
    description: "Edit Initiative",
    actionBinding: c.EditInitiative,
    defaultKeyBinding: "alt+i",
    fontAwesomeIcon: "stopwatch",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "link-initiative",
    description: "Link Initiative",
    actionBinding: c.LinkInitiative,
    defaultKeyBinding: "alt+l",
    fontAwesomeIcon: "link",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "move-down",
    description: "Move Down",
    actionBinding: c.MoveDown,
    defaultKeyBinding: "alt+j",
    fontAwesomeIcon: "angle-double-down"
  }),
  new Command({
    id: "move-up",
    description: "Move Up",
    actionBinding: c.MoveUp,
    defaultKeyBinding: "alt+k",
    fontAwesomeIcon: "angle-double-up"
  }),
  new Command({
    id: "select-next",
    description: "Select Next",
    actionBinding: c.SelectNext,
    defaultKeyBinding: "j",
    fontAwesomeIcon: "arrow-down",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "select-previous",
    description: "Select Previous",
    actionBinding: c.SelectPrevious,
    defaultKeyBinding: "k",
    fontAwesomeIcon: "arrow-up",
    defaultShowOnActionBar: false
  })
];
