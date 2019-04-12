import * as ko from "knockout";
import * as _ from "lodash";
import * as Mousetrap from "mousetrap";

import { CommandSetting } from "../../common/CommandSetting";
import { HpVerbosityOption } from "../../common/PlayerViewSettings";
import {
  getDefaultSettings,
  AutoGroupInitiativeOption,
  Settings
} from "../../common/Settings";
import { Command } from "../Commands/Command";
import { Store } from "../Utility/Store";

export const CurrentSettings = ko.observable<Settings>();

function getLegacySetting<T>(settingName: string, def: T): T {
  const setting = Store.Load<T>(Store.User, settingName);
  if (setting === null) {
    return def;
  }
  return setting;
}

function getLegacySettings(): Settings {
  const commandNames = Store.List(Store.KeyBindings);
  const commands: CommandSetting[] = commandNames.map(n => {
    return {
      Name: n,
      KeyBinding: Store.Load<string>(Store.KeyBindings, n),
      ShowOnActionBar: Store.Load<boolean>(Store.ActionBar, n)
    };
  });
  const defaultSettings = getDefaultSettings();

  return {
    Commands: commands,
    Rules: {
      ...defaultSettings.Rules,
      RollMonsterHp: getLegacySetting<boolean>("RollMonsterHP", false),
      AllowNegativeHP: getLegacySetting<boolean>("AllowNegativeHP", false),
      AutoCheckConcentration: getLegacySetting<boolean>(
        "AutoCheckConcentration",
        true
      ),
      AutoGroupInitiative: getLegacySetting<AutoGroupInitiativeOption>(
        "AutoGroupInitiative",
        AutoGroupInitiativeOption.None
      )
    },
    TrackerView: {
      ...defaultSettings.TrackerView,
      DisplayRoundCounter: getLegacySetting<boolean>(
        "DisplayRoundCounter",
        false
      ),
      DisplayTurnTimer: getLegacySetting<boolean>("DisplayTurnTimer", false),
      DisplayDifficulty: getLegacySetting<boolean>("DisplayDifficulty", false)
    },
    PlayerView: {
      ...defaultSettings.PlayerView,
      AllowPlayerSuggestions: getLegacySetting<boolean>(
        "PlayerViewAllowPlayerSuggestions",
        false
      ),
      ActiveCombatantOnTop: getLegacySetting<boolean>(
        "ActiveCombatantOnTop",
        false
      ),
      MonsterHPVerbosity: getLegacySetting<HpVerbosityOption>(
        "MonsterHPVerbosity",
        HpVerbosityOption.ColoredLabel
      ),
      HideMonstersOutsideEncounter: getLegacySetting<boolean>(
        "HideMonstersOutsideEncounter",
        false
      ),
      DisplayRoundCounter: getLegacySetting<boolean>(
        "PlayerViewDisplayRoundCounter",
        false
      ),
      DisplayTurnTimer: getLegacySetting<boolean>(
        "PlayerViewDisplayTurnTimer",
        false
      )
    },
    Version: defaultSettings.Version
  };
}

function applyNewCommandSettings(newSettings: Settings, commands: Command[]) {
  Mousetrap.reset();

  Mousetrap.bind("backspace", e => {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      // internet explorer
      e.returnValue = false;
    }
  });

  commands.forEach(command => {
    const commandSetting = _.find(
      newSettings.Commands,
      c => c.Name == command.Id
    );
    if (commandSetting) {
      command.KeyBinding = commandSetting.KeyBinding;
      command.ShowOnActionBar(commandSetting.ShowOnActionBar);
    }
    Mousetrap.bind(command.KeyBinding, command.ActionBinding);
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
  const localSettings = Store.Load<any>(Store.User, "Settings");

  if (localSettings) {
    const updatedSettings = UpdateSettings(localSettings);
    CurrentSettings(updatedSettings);
  } else {
    const legacySettings = getLegacySettings();
    CurrentSettings(legacySettings);
  }

  Store.Save<Settings>(Store.User, "Settings", CurrentSettings());
}

export function SubscribeCommandsToSettingsChanges(commands: Command[]) {
  applyNewCommandSettings(CurrentSettings(), commands);
  CurrentSettings.subscribe(newSettings =>
    applyNewCommandSettings(newSettings, commands)
  );
}

export function AddMissingCommandsAndSaveSettings(
  settings: Settings,
  commands: Command[]
) {
  for (const command of commands) {
    if (!settings.Commands.some(c => c.Name == command.Id)) {
      settings.Commands.push({
        Name: command.Id,
        KeyBinding: command.KeyBinding,
        ShowOnActionBar: command.ShowOnActionBar()
      });
    }
  }

  Store.Save(Store.User, "Settings", settings);
  CurrentSettings(settings);
}
