import { Store } from "../Utility/Store";
import { EncounterCommander } from "./EncounterCommander";
import { CombatantCommander } from "./CombatantCommander";

export class Command {
    ShowOnActionBar: KnockoutObservable<boolean>;
    ToolTip: KnockoutComputed<string>;
    constructor(public Description: string,
        public ActionBinding: () => any,
        public KeyBinding: string = "",
        public ActionBarIcon: string = "",
        showOnActionBar: boolean = true,
        public LockOnActionBar: boolean = false) {
        this.ShowOnActionBar = ko.observable(showOnActionBar);
        if (LockOnActionBar) {
            this.ShowOnActionBar.subscribe(_ => {
                this.ShowOnActionBar(true);
            });
        }

        this.ToolTip = ko.pureComputed(() => `${this.Description} [${this.KeyBinding}]`);

        let keyBinding = Store.Load<string>(Store.KeyBindings, this.Description);
        if (keyBinding) {
            this.KeyBinding = keyBinding;
        }

        let showOnActionBarSetting = Store.Load<boolean>(Store.ActionBar, this.Description);
        if (showOnActionBarSetting != null) {
            this.ShowOnActionBar(showOnActionBarSetting);
        }

    }
}

export var BuildEncounterCommandList: (c: EncounterCommander) => Command[] = c => [
    new Command("Toggle Menu", c.ToggleToolbarWidth, "alt+m", "fa-bars", true, true),
    new Command("Start Encounter", c.StartEncounter, "alt+r", "fa-play"),
    new Command("End Encounter", c.EndEncounter, "alt+e", "fa-stop"),
    new Command("Reroll Initiative", c.RerollInitiative, "alt+shift+i", "fa-refresh", false),
    new Command("Clear Encounter", c.ClearEncounter, "alt+del", "fa-trash"),
    new Command("Open Library", c.ShowLibraries, "alt+a", "fa-user-plus"),
    new Command("Show Player Window", c.LaunchPlayerWindow, "alt+w", "fa-users"),
    new Command("Next Turn", c.NextTurn, "n", "fa-step-forward"),
    new Command("Previous Turn", c.PreviousTurn, "alt+n", "fa-step-backward"),
    new Command("Save Encounter", c.SaveEncounter, "alt+s", "fa-save"),
    new Command("Settings", c.ShowSettings, "?", "fa-gear", true, true)
]

export var BuildCombatantCommandList: (c: CombatantCommander) => Command[] = c => [
    new Command("Damage/Heal", c.EditHP, "t", "fa-plus-circle"),
    new Command("Apply Temporary HP", c.AddTemporaryHP, "alt+t", "fa-medkit"),
    new Command("Add Note", c.AddTag, "g", "fa-tag", false),
    new Command("Remove from Encounter", c.Remove, "del", "fa-remove"),
    new Command("Rename", c.EditName, "f2", "fa-i-cursor"),
    new Command("Edit Statblock", c.EditStatBlock, "alt+e", "fa-edit", false),
    new Command("Edit Initiative", c.EditInitiative, "alt+i", "fa-play-circle-o", false),
    new Command("Link Initiative", c.LinkInitiative, "alt+l", "fa-link", false),
    new Command("Move Down", c.MoveDown, "alt+j", "fa-angle-double-down"),
    new Command("Move Up", c.MoveUp, "alt+k", "fa-angle-double-up"),
    new Command("Select Next", c.SelectNext, "j", "fa-arrow-down", false),
    new Command("Select Previous", c.SelectPrevious, "k", "fa-arrow-up", false)
]
