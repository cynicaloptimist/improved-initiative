import * as ko from "knockout";
import * as _ from "lodash";
import * as Mousetrap from "mousetrap";

import {
  getDefaultSettings,
  Settings
} from "../../common/Settings";
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

function updateToSemanticVersionIsRequired(
  settingsVersion: string,
  targetVersion: string
) {
  const settingsVersionParts = settingsVersion.split(".").map(n => parseInt(n));
  const targetVersionParts = targetVersion.split(".").map(n => parseInt(n));
  if (settingsVersionParts[0] < targetVersionParts[0]) {
    return true;
  }
  if (settingsVersionParts[0] > targetVersionParts[0]) {
    return false;
  }
  if (settingsVersionParts[1] < targetVersionParts[1]) {
    return true;
  }
  if (settingsVersionParts[1] > targetVersionParts[1]) {
    return false;
  }
  if (settingsVersionParts[2] < targetVersionParts[2]) {
    return true;
  }
  if (settingsVersionParts[2] > targetVersionParts[2]) {
    return false;
  }
  return false;
}

export function UpdateSettings(settings: any): Settings {
  const defaultSettings = getDefaultSettings();

  if (!settings.PlayerView) {
    settings.PlayerView = defaultSettings.PlayerView;
  }

  if (!settings.PlayerView.CustomStyles) {
    settings.PlayerView.CustomStyles = defaultSettings.PlayerView.CustomStyles;
  }

  if (updateToSemanticVersionIsRequired(settings.Version, "1.2.0")) {
    settings.PlayerView.CustomCSS = defaultSettings.PlayerView.CustomCSS;
  }

  if (updateToSemanticVersionIsRequired(settings.Version, "1.3.0")) {
    settings.PlayerView.CustomStyles.backgroundUrl =
      defaultSettings.PlayerView.CustomStyles.backgroundUrl;
  }

  return settings;
}

export function InitializeSettings() {
  const localSettings = LegacySynchronousLocalStore.Load<any>(
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
