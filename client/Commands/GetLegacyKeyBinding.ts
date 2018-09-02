import _ = require("lodash");
import { Settings } from "../Settings/Settings";
import { Store } from "../Utility/Store";

const LegacyCommandSettingsKeys = {
    "toggle-menu": "Toggle Menu",
    "start-encounter": "Start Encounter",
    "reroll-initiative": "Reroll Initiative",
    "end-encounter": "End Encounter",
    "clear-encounter": "Clear Encounter",
    "open-library": "Open Library",
    "quick-add": "Quick Add Combatant",
    "player-window": "Show Player Window",
    "next-turn": "Next Turn",
    "previous-turn": "Previous Turn",
    "save-encounter": "Save Encounter",
    "settings": "Settings",
    "apply-damage": "Damage/Heal",
    "apply-temporary-hp": "Apply Temporary HP",
    "add-tag": "Add Note",
    "remove": "Remove from Encounter",
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
    const settings = Store.Load<Settings>(Store.User, "Settings");
    const legacyId = LegacyCommandSettingsKeys[id];
    const commandSetting = settings && settings.Commands && _.find(settings.Commands, c => c.Name == legacyId);
    if (commandSetting && commandSetting.KeyBinding) {
        return commandSetting.KeyBinding;
    }

    const legacyKeybinding = Store.Load<string>(Store.KeyBindings, legacyId);
    if (legacyKeybinding) {
        return legacyKeybinding;
    }

    return null;
}
