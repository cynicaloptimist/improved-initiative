import * as ko from "knockout";

import { Store } from "../Utility/Store";

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
