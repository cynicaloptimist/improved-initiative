import * as Mousetrap from "mousetrap";

import { getDefaultSettings, Settings } from "../../common/Settings";
import { Command } from "../Commands/Command";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import {
  CurrentSettings,
  GetAppleBackspaceAlias,
  InitializeSettings,
  IsAppleBackspacePlatform,
  SubscribeCommandsToSettingsChanges
} from "./Settings";

const backspaceKeyCode = 8;
const deleteKeyCode = 46;

function setPlatform(platform: string) {
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: platform
  });
}

function dispatchKeyDown(which: number) {
  const event = new KeyboardEvent("keydown", { bubbles: true });
  Object.defineProperty(event, "which", { value: which });
  document.dispatchEvent(event);
}

function MakeRemoveCommand(actionBinding: jest.Mock) {
  return new Command({
    id: "remove",
    description: "Remove",
    actionBinding,
    fontAwesomeIcon: "times"
  });
}

describe("Settings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    Mousetrap.reset();
    delete (navigator as { platform?: string }).platform;
  });

  test("Initializes to default settings", () => {
    InitializeSettings();
    expect(CurrentSettings()).toEqual(getDefaultSettings());
  });

  test("Saves default settings to localStorage", () => {
    InitializeSettings();
    expect(
      LegacySynchronousLocalStore.Load<Settings>(
        LegacySynchronousLocalStore.User,
        "Settings"
      )
    ).toEqual(getDefaultSettings());
  });

  test("Identifies platforms that use Backspace for Delete shortcuts", () => {
    expect(IsAppleBackspacePlatform("MacIntel")).toBe(true);
    expect(IsAppleBackspacePlatform("Macintosh")).toBe(true);
    expect(IsAppleBackspacePlatform("iPad")).toBe(true);
  });

  test(
    "Does not identify unrelated platforms as Apple Backspace platforms",
    () => {
      expect(IsAppleBackspacePlatform("Win32")).toBe(false);
      expect(IsAppleBackspacePlatform("iPhone")).toBe(false);
    }
  );

  test("Aliases standalone Delete keys without matching substrings", () => {
    expect(GetAppleBackspaceAlias("del")).toEqual("backspace");
    expect(GetAppleBackspaceAlias("alt+shift+del")).toEqual(
      "alt+shift+backspace"
    );
    expect(GetAppleBackspaceAlias("del del")).toEqual(
      "backspace backspace"
    );
    expect(GetAppleBackspaceAlias("delete")).toBeNull();
    expect(GetAppleBackspaceAlias("alt+o")).toBeNull();
  });

  test("Runs Delete shortcuts with Backspace on Mac", () => {
    CurrentSettings(getDefaultSettings());
    setPlatform("MacIntel");
    const actionBinding = jest.fn();

    SubscribeCommandsToSettingsChanges([MakeRemoveCommand(actionBinding)]);
    dispatchKeyDown(backspaceKeyCode);

    expect(actionBinding).toHaveBeenCalledTimes(1);

    dispatchKeyDown(deleteKeyCode);
    expect(actionBinding).toHaveBeenCalledTimes(2);
  });

  test("Keeps Windows Backspace separate from Delete shortcuts", () => {
    CurrentSettings(getDefaultSettings());
    setPlatform("Win32");
    const actionBinding = jest.fn();

    SubscribeCommandsToSettingsChanges([MakeRemoveCommand(actionBinding)]);
    dispatchKeyDown(backspaceKeyCode);
    expect(actionBinding).not.toHaveBeenCalled();

    dispatchKeyDown(deleteKeyCode);
    expect(actionBinding).toHaveBeenCalledTimes(1);
  });
});
