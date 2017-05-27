import { Store } from "../Utility/Store";

export class Command {
    ShowOnActionBar: KnockoutObservable<boolean>;
    ToolTip: KnockoutComputed<string>;
    constructor(public Description: string,
        public ActionBinding: () => any,
        public KeyBinding: string = '',
        public ActionBarIcon: string = '',
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
