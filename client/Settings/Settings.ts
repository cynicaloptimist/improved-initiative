import * as ko from "knockout";
import * as _ from "lodash";
import * as Mousetrap from "mousetrap";

import { getDefaultSettings, Settings } from "../../common/Settings";
import { Command } from "../Commands/Command";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";

export const CurrentSettings = ko.observable<Settings>();

/**
 * MacBook keyboards report their Delete key as Backspace, while an external
 * keyboard can still provide a forward Delete key.
 */
export function IsAppleBackspacePlatform(platform: string): boolean {
  return platform.startsWith("Mac") || platform.startsWith("iPad");
}

/**
 * Returns the Backspace equivalent of a Delete-based shortcut.
 *
 * @param keyBinding Configured Mousetrap key binding.
 * @returns Equivalent Backspace binding, or `null` if it has no Delete key.
 */
export function GetAppleBackspaceAlias(keyBinding: string): string | null {
  // Mousetrap sequences (for example, "g i") use spaces between consecutive
  // key presses; each step can combine keys with "+".
  const alias = keyBinding
    .split(" ")
    .map(keyCombination =>
      keyCombination
        .split("+")
        .map(key => (key === "del" ? "backspace" : key))
        .join("+")
    )
    .join(" ");
  return alias === keyBinding ? null : alias;
}

function applyNewCommandSettings(newSettings: Settings, commands: Command[]) {
  Mousetrap.reset();

  Mousetrap.bind("backspace", e => {
    e.preventDefault();
  });

  // we need to determine del->backspace alias only for some apple devices
  const getAppleAlias = IsAppleBackspacePlatform(navigator.platform ?? "") ?
    GetAppleBackspaceAlias :
    () => null;

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

    const keys = [command.KeyBinding];
    const appleAlias = getAppleAlias(command.KeyBinding);
    if (appleAlias) {
      keys.push(appleAlias);
    }
    Mousetrap.bind(keys, (e: Event) => {
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

  if (_.get(oldSettings, "PreloadedStatBlockSources.wotc-srd")) {
    updatedSettings.PreloadedStatBlockSources["srd-2024"] = true;
    updatedSettings.PreloadedStatBlockSources["wotc-srd"] = false;
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

export function SubscribeToDarkModeChanges() {
  function applyDarkModeToBody(settings: Settings) {
    const darkMode = settings.TrackerView.DarkMode;
    document.body.classList.toggle("dark-mode", darkMode);
  }

  applyDarkModeToBody(CurrentSettings());
  CurrentSettings.subscribe(applyDarkModeToBody);
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
