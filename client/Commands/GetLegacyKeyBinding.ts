import _ = require("lodash");
import { Settings } from "../../common/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";

const LegacyCommandSettingsKeys = {
  "toggle-menu": "Toggle Menu",
  "start-encounter": "Start Encounter",
  "reroll-initiative": "Reroll Initiative",
  "end-encounter": "End Encounter",
  "clean-encounter": "Clear Encounter",
  "open-library": "Open Library",
  "quick-add": "Quick Add Combatant",
  "player-window": "Show Player Window",
  "next-turn": "Next Turn",
  "previous-turn": "Previous Turn",
  "save-encounter": "Save Encounter",
  settings: "Settings",
  "apply-damage": "Damage/Heal",
  "apply-temporary-hp": "Apply Temporary HP",
  "add-tag": "Add Note",
  remove: "Remove from Encounter",
  "set-alias": "Rename",
  "edit-statblock": "Edit Statblock",
  "set-initiative": "Edit Initiative",
  "link-initiative": "Link Initiative",
  "move-down": "Move Down",
  "move-up": "Move Up",
  "select-next": "Select Next",
  "select-previous": "Select Previous"
};

export function GetLegacyKeyBinding(id: string) {
  const settings = LegacySynchronousLocalStore.Load<Settings>(
    LegacySynchronousLocalStore.User,
    "Settings"
  );
  const legacyId = LegacyCommandSettingsKeys[id];
  const commandSetting = _.find(
    settings?.Commands || [],
    c => c.Name == legacyId
  );
  if (commandSetting?.KeyBinding) {
    return commandSetting.KeyBinding;
  }

  const legacyKeybinding = LegacySynchronousLocalStore.Load<string>(
    LegacySynchronousLocalStore.KeyBindings,
    legacyId
  );
  if (legacyKeybinding) {
    return legacyKeybinding;
  }

  return null;
}
