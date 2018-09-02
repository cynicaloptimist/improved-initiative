import * as ko from "knockout";

import _ = require("lodash");
import { Settings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import { CommandSetting } from "./CommandSetting";
import { LegacyCommandSettingsKeys } from "./LegacyCommandSettingsKeys";

export class Command {
    public ShowOnActionBar: KnockoutObservable<boolean>;
    public ToolTip: KnockoutComputed<string>;
    public KeyBinding: string;
    constructor(
        public Id: string,
        public Description: string,
        public ActionBinding: () => any,
        defaultKeyBinding: string,
        public FontAwesomeIcon: string,
        defaultShowOnActionBar = true,
        public LockOnActionBar = false) {
        this.ShowOnActionBar = ko.observable(defaultShowOnActionBar);
        if (LockOnActionBar) {
            this.ShowOnActionBar.subscribe(_ => {
                this.ShowOnActionBar(true);
            });
        }

        this.ToolTip = ko.pureComputed(() => `${this.Description} [${this.KeyBinding}]`);

        const settings = Store.Load<Settings>(Store.User, "Settings");
        const commandSetting = settings && _.find(settings.Commands, c => c.Name == this.Id);

        const legacyKeybinding = LegacyCommandSettingsKeys[this.Id] && Store.Load<string>(Store.KeyBindings, LegacyCommandSettingsKeys[this.Id]);

        this.KeyBinding = (commandSetting && commandSetting.KeyBinding) || legacyKeybinding || defaultKeyBinding;

        let showOnActionBarSetting = Store.Load<boolean>(Store.ActionBar, this.Description);
        if (showOnActionBarSetting != null) {
            this.ShowOnActionBar(showOnActionBarSetting);
        }

    }
}
