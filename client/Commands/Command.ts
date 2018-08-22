import * as ko from "knockout";

import { Store } from "../Utility/Store";
import { CombatantCommander } from "./CombatantCommander";
import { EncounterCommander } from "./EncounterCommander";

export class Command {
    public ShowOnActionBar: KnockoutObservable<boolean>;
    public ToolTip: KnockoutComputed<string>;
    public KeyBinding: string;
    constructor(
        public Id: string,
        public Description: string,
        public ActionBinding: () => any,
        defaultKeyBinding: string,
        public FontAwesomeIcon = "",
        showOnActionBar = true,
        public LockOnActionBar = false) {
        this.ShowOnActionBar = ko.observable(showOnActionBar);
        if (LockOnActionBar) {
            this.ShowOnActionBar.subscribe(_ => {
                this.ShowOnActionBar(true);
            });
        }

        this.ToolTip = ko.pureComputed(() => `${this.Description} [${this.KeyBinding}]`);

        const savedKeybinding = Store.Load<string>(Store.KeyBindings, this.Description);
        if (savedKeybinding) {
            this.KeyBinding = savedKeybinding;
        } else {
            this.KeyBinding = defaultKeyBinding;
        }

        let showOnActionBarSetting = Store.Load<boolean>(Store.ActionBar, this.Description);
        if (showOnActionBarSetting != null) {
            this.ShowOnActionBar(showOnActionBarSetting);
        }

    }
}

export let BuildEncounterCommandList = (c: EncounterCommander, saveEncounterFn: () => void) => [
    new Command("toggle-menu", "Toggle Menu", c.ToggleToolbarWidth, "alt+m", "bars", true, true),
    new Command("start-encounter", "Start Encounter", c.StartEncounter, "alt+r", "play"),
    new Command("reroll-initiative", "Reroll Initiative", c.RerollInitiative, "alt+shift+i", "refresh", false),
    new Command("end-encounter", "End Encounter", c.EndEncounter, "alt+e", "stop"),
    new Command("clear-encounter", "Clear Encounter", c.ClearEncounter, "alt+del", "trash"),
    new Command("open-library", "Open Library", c.ShowLibraries, "alt+a", "user-plus"),
    new Command("quick-add", "Quick Add Combatant", c.QuickAddStatBlock, "alt+q", "asterisk"),
    new Command("player-window", "Show Player Window", c.LaunchPlayerWindow, "alt+w", "users"),
    new Command("next-turn", "Next Turn", c.NextTurn, "n", "step-forward"),
    new Command("previous-turn", "Previous Turn", c.PreviousTurn, "alt+n", "step-backward"),
    new Command("save-encounter", "Save Encounter", saveEncounterFn, "alt+s", "save"),
    new Command("settings", "Settings", c.ShowSettings, "?", "gear", true, true)
];

export let BuildCombatantCommandList: (c: CombatantCommander) => Command[] = c => [
    new Command("combatant-apply-damage", "Damage/Heal", c.EditHP, "t", "plus-circle"),
    new Command("combatant-apply-temporary-hp", "Apply Temporary HP", c.AddTemporaryHP, "alt+t", "medkit"),
    new Command("combatant-add-tag", "Add Note", c.AddTag, "g", "tag", false),
    new Command("combatant-remove", "Remove from Encounter", c.Remove, "del", "remove"),
    new Command("combatant-set-alias", "Rename", c.SetAlias, "f2", "i-cursor"),
    new Command("combatant-edit-statblock", "Edit Statblock", c.EditStatBlock, "alt+e", "edit", false),
    new Command("combatant-set-initiative", "Edit Initiative", c.EditInitiative, "alt+i", "play-circle-o", false),
    new Command("combatant-link-initiative", "Link Initiative", c.LinkInitiative, "alt+l", "link", false),
    new Command("combatant-move-down", "Move Down", c.MoveDown, "alt+j", "angle-double-down"),
    new Command("combatant-move-up", "Move Up", c.MoveUp, "alt+k", "angle-double-up"),
    new Command("select-next", "Select Next", c.SelectNext, "j", "arrow-down", false),
    new Command("select-previous", "Select Previous", c.SelectPrevious, "k", "arrow-up", false)
];
