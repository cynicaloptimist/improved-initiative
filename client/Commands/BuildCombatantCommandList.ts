import { CombatantCommander } from "./CombatantCommander";
import { Command } from "./Command";

export const BuildCombatantCommandList: (
  c: CombatantCommander
) => Command[] = c => [
  new Command({
    id: "apply-damage",
    description: "Apply Damage",
    actionBinding: c.EditHP,
    fontAwesomeIcon: "fist-raised"
  }),
  new Command({
    id: "apply-healing",
    description: "Apply Healing",
    actionBinding: c.ApplyHealing,
    fontAwesomeIcon: "heart",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "apply-temporary-hp",
    description: "Apply Temporary HP",
    actionBinding: c.AddTemporaryHP,
    fontAwesomeIcon: "medkit",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "add-tag",
    description: "Add Tag",
    actionBinding: c.AddTag,
    fontAwesomeIcon: "tag",
    defaultShowOnActionBar: false,
    defaultShowInCombatantRow: true
  }),
  new Command({
    id: "update-notes",
    description: "Update Persistent Notes",
    actionBinding: c.UpdateNotes,
    fontAwesomeIcon: "file-alt",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "remove",
    description: "Remove from Encounter",
    actionBinding: c.Remove,
    fontAwesomeIcon: "times"
  }),
  new Command({
    id: "set-alias",
    description: "Rename",
    actionBinding: c.SetAlias,
    fontAwesomeIcon: "i-cursor"
  }),
  new Command({
    id: "toggle-hidden",
    description: "Hide/Reveal in Player View",
    actionBinding: c.ToggleHidden,
    fontAwesomeIcon: "eye",
    defaultShowOnActionBar: false,
    defaultShowInCombatantRow: true
  }),
  new Command({
    id: "toggle-reveal-ac",
    description: "Reveal/Hide AC in Player View",
    actionBinding: c.ToggleRevealedAC,
    fontAwesomeIcon: "shield-alt",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "edit-statblock",
    description: "Edit Unique Statblock",
    actionBinding: c.EditOwnStatBlock,
    fontAwesomeIcon: "edit",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "quick-edit-statblock",
    description: "Quick Edit Combatant",
    actionBinding: c.QuickEditOwnStatBlock,
    fontAwesomeIcon: "magic",
    defaultShowOnActionBar: true
  }),
  new Command({
    id: "set-initiative",
    description: "Edit Initiative",
    actionBinding: c.EditInitiative,
    fontAwesomeIcon: "stopwatch",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "link-initiative",
    description: "Link Initiative",
    actionBinding: c.LinkInitiative,
    fontAwesomeIcon: "link",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "move-down",
    description: "Move Down",
    actionBinding: c.MoveDown,
    fontAwesomeIcon: "angle-double-down"
  }),
  new Command({
    id: "move-up",
    description: "Move Up",
    actionBinding: c.MoveUp,
    fontAwesomeIcon: "angle-double-up"
  }),
  new Command({
    id: "select-next",
    description: "Select Next",
    actionBinding: c.SelectNext,
    fontAwesomeIcon: "arrow-down",
    defaultShowOnActionBar: false
  }),
  new Command({
    id: "select-previous",
    description: "Select Previous",
    actionBinding: c.SelectPrevious,
    fontAwesomeIcon: "arrow-up",
    defaultShowOnActionBar: false
  })
];
