import * as ko from "knockout";
import * as _ from "lodash";
import * as Mousetrap from "mousetrap";

import { getDefaultSettings, Settings } from "../../common/Settings";
import { Command } from "../Commands/Command";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";

export const CurrentSettings = ko.observable<Settings>();

function applyNewCommandSettings(newSettings: Settings, commands: Command[]) {
  Mousetrap.reset();

  Mousetrap.bind("backspace", e => {
    e.preventDefault();
  });

  commands.forEach(command => {
    const commandSetting = _.find(
      newSettings.Commands,
      c => c.Name == command.Id
    );
    if (commandSetting) {
      command.KeyBinding = commandSetting.KeyBinding;
      command.ShowOnActionBar(commandSetting.ShowOnActionBar);
      command.ShowInCombatantRow(commandSetting.ShowInCombatantRow);
    }
    Mousetrap.bind(command.KeyBinding, (e: Event) => {
      e.preventDefault();
      command.ActionBinding();
    });
  });
}

export function UpdateSettings(oldSettings: any): Settings {
  const updatedSettings = _.merge(getDefaultSettings(), oldSettings);
  if (_.get(oldSettings, "PreloadedContent.Open5eContent")) {
    updatedSettings.PreloadedStatBlockSources["cc"] = true;
    updatedSettings.PreloadedStatBlockSources["tob"] = true;
    updatedSettings.PreloadedStatBlockSources["tob2"] = true;
    updatedSettings.PreloadedStatBlockSources["tob3"] = true;
    delete updatedSettings.PreloadedContent.Open5eContent;
  }
  return updatedSettings;
}

export function InitializeSettings() {
  const localSettings = LegacySynchronousLocalStore.Load<unknown>(
    LegacySynchronousLocalStore.User,
    "Settings"
  );

  if (localSettings) {
    const updatedSettings = UpdateSettings(localSettings);
    CurrentSettings(updatedSettings);
  } else {
    CurrentSettings(getDefaultSettings());
  }

  LegacySynchronousLocalStore.Save<Settings>(
    LegacySynchronousLocalStore.User,
    "Settings",
    CurrentSettings()
  );
}

export function SubscribeCommandsToSettingsChanges(commands: Command[]) {
  applyNewCommandSettings(CurrentSettings(), commands);
  CurrentSettings.subscribe(newSettings =>
    applyNewCommandSettings(newSettings, commands)
  );
}

export function UpdateLegacyCommandSettingsAndSave(
  settings: Settings,
  commands: Command[]
) {
  for (const command of commands) {
    const commandSetting = settings.Commands.find(c => c.Name == command.Id);
    if (!commandSetting) {
      settings.Commands.push({
        Name: command.Id,
        KeyBinding: command.KeyBinding,
        ShowOnActionBar: command.ShowOnActionBar(),
        ShowInCombatantRow: command.ShowInCombatantRow()
      });
    } else {
      if (commandSetting.ShowInCombatantRow === undefined) {
        commandSetting.ShowInCombatantRow = command.ShowInCombatantRow();
      }
    }
  }

  LegacySynchronousLocalStore.Save(
    LegacySynchronousLocalStore.User,
    "Settings",
    settings
  );
  CurrentSettings(settings);
}
