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
    new Command("reroll-initiative", "Reroll Initiative", c.RerollInitiative, "alt+shift+i", "sync", false),
    new Command("end-encounter", "End Encounter", c.EndEncounter, "alt+e", "stop"),
    new Command("clear-encounter", "Clear Encounter", c.ClearEncounter, "alt+shift+del", "trash", false),
    new Command("clean-encounter", "Clean Encounter", c.CleanEncounter, "alt+del", "broom"),
    new Command("open-library", "Open Library", c.ShowLibraries, "alt+a", "book"),
    new Command("quick-add", "Quick Add Combatant", c.QuickAddStatBlock, "alt+q", "bolt", false),
    new Command("player-window", "Show Player Window", c.LaunchPlayerWindow, "alt+w", "users"),
    new Command("next-turn", "Next Turn", c.NextTurn, "n", "step-forward"),
    new Command("previous-turn", "Previous Turn", c.PreviousTurn, "alt+n", "step-backward", false),
    new Command("save-encounter", "Save Encounter", saveEncounterFn, "alt+s", "save"),
    new Command("settings", "Settings", c.ShowSettings, "?", "cog", true, true)
];

export let BuildCombatantCommandList: (c: CombatantCommander) => Command[] = c => [
    new Command("apply-damage", "Damage/Heal", c.EditHP, "t", "plus-circle"),
    new Command("apply-temporary-hp", "Apply Temporary HP", c.AddTemporaryHP, "alt+t", "medkit", false),
    new Command("add-tag", "Add Note", c.AddTag, "g", "tag", false),
    new Command("remove", "Remove from Encounter", c.Remove, "del", "times"),
    new Command("set-alias", "Rename", c.SetAlias, "f2", "i-cursor"),
    new Command("edit-statblock", "Edit Statblock", c.EditStatBlock, "alt+e", "edit", false),
    new Command("set-initiative", "Edit Initiative", c.EditInitiative, "alt+i", "play-circle", false),
    new Command("link-initiative", "Link Initiative", c.LinkInitiative, "alt+l", "link", false),
    new Command("move-down", "Move Down", c.MoveDown, "alt+j", "angle-double-down"),
    new Command("move-up", "Move Up", c.MoveUp, "alt+k", "angle-double-up"),
    new Command("select-next", "Select Next", c.SelectNext, "j", "arrow-down", false),
    new Command("select-previous", "Select Previous", c.SelectPrevious, "k", "arrow-up", false)
];
