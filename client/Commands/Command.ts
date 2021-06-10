import * as ko from "knockout";

import _ = require("lodash");
import { Settings } from "../../common/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { GetLegacyKeyBinding } from "./GetLegacyKeyBinding";
import { DefaultKeybindings } from "./DefaultKeybindings";

export class Command {
  public ShowOnActionBar: KnockoutObservable<boolean>;
  public ShowInCombatantRow: KnockoutObservable<boolean>;
  public ToolTip: KnockoutComputed<string>;
  public KeyBinding: string;
  public Id: string;
  public Description: string;
  public ActionBinding: () => any;
  public FontAwesomeIcon: KnockoutComputed<string>;
  public LockOnActionBar?: boolean;

  constructor(props: {
    id: string;
    description: string;
    actionBinding: () => any;
    fontAwesomeIcon: string | (() => string);
    defaultShowOnActionBar?: boolean;
    defaultShowInCombatantRow?: boolean;
    lockOnActionBar?: boolean;
  }) {
    this.Id = props.id;
    this.Description = props.description;
    this.ActionBinding = props.actionBinding;

    if (typeof props.fontAwesomeIcon === "string") {
      this.FontAwesomeIcon = ko.computed(() => props.fontAwesomeIcon as string);
    } else {
      this.FontAwesomeIcon = ko.computed(props.fontAwesomeIcon);
    }

    this.LockOnActionBar = props.lockOnActionBar || false;

    this.ShowOnActionBar = ko.observable(props.defaultShowOnActionBar ?? true);
    this.ShowInCombatantRow = ko.observable(
      props.defaultShowInCombatantRow ?? false
    );

    if (this.LockOnActionBar) {
      this.ShowOnActionBar.subscribe(_ => {
        this.ShowOnActionBar(true);
      });
    }

    this.ToolTip = ko.pureComputed(
      () => `${this.Description} [${this.KeyBinding}]`
    );

    const settings = LegacySynchronousLocalStore.Load<Settings>(
      LegacySynchronousLocalStore.User,
      "Settings"
    );
    const commandSetting =
      settings && _.find(settings.Commands, c => c.Name == this.Id);

    if (commandSetting == undefined) {
      this.KeyBinding =
        GetLegacyKeyBinding(this.Id) || DefaultKeybindings[this.Id] || "";
      const showOnActionBarSetting = LegacySynchronousLocalStore.Load<boolean>(
        LegacySynchronousLocalStore.ActionBar,
        this.Description
      );
      if (showOnActionBarSetting != null) {
        this.ShowOnActionBar(showOnActionBarSetting);
      }
    } else {
      this.KeyBinding = commandSetting.KeyBinding;
      this.ShowOnActionBar(commandSetting.ShowOnActionBar);
    }
  }
}
