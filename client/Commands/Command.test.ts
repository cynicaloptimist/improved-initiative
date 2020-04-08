import { getDefaultSettings } from "../../common/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Command } from "./Command";

const MakeCommand = () => ({
  id: "some-command-id",
  description: "Some Command",
  actionBinding: jest.fn(),
  fontAwesomeIcon: "square"
});

describe("Command", () => {
  test("Should look up default keybinding by id", () => {
    const command = new Command({
      ...MakeCommand(),
      id: "start-encounter"
    });
    expect(command.KeyBinding).toEqual("alt+r");
  });

  test("Should load a saved keybinding", () => {
    const settings = getDefaultSettings();
    settings.Commands = [
      {
        Name: "some-command-id",
        KeyBinding: "saved-keybinding",
        ShowOnActionBar: true,
        ShowInCombatantRow: false
      }
    ];
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "Settings",
      settings
    );

    const command = new Command(MakeCommand());
    expect(command.KeyBinding).toEqual("saved-keybinding");
  });

  test("Should load a keybinding with a legacy Add Note id", () => {
    const settings = getDefaultSettings();
    settings.Commands = [
      {
        Name: "Add Note",
        KeyBinding: "legacy-keybinding",
        ShowOnActionBar: true,
        ShowInCombatantRow: false
      }
    ];
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "Settings",
      settings
    );

    const command = new Command({
      ...MakeCommand(),
      id: "add-tag"
    });
    expect(command.KeyBinding).toEqual("legacy-keybinding");
  });

  test("Should load a keybinding from the old Store", () => {
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.KeyBindings,
      "Add Note",
      "legacy-keybinding"
    );
    const command = new Command({
      ...MakeCommand(),
      id: "add-tag"
    });
    expect(command.KeyBinding).toEqual("legacy-keybinding");
  });
});
