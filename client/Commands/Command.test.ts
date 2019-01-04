import { getDefaultSettings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import { Command } from "./Command";

describe("Command", () => {
  test("Should use a default keybinding", () => {
    const command = new Command(
      "some-command-id",
      "Some Command",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(command.KeyBinding).toEqual("default-keybinding");
  });

  test("Should load a saved keybinding", () => {
    const settings = getDefaultSettings();
    settings.Commands = [
      {
        Name: "some-command-id",
        KeyBinding: "saved-keybinding",
        ShowOnActionBar: true
      }
    ];
    Store.Save(Store.User, "Settings", settings);

    const command = new Command(
      "some-command-id",
      "Some Command",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(command.KeyBinding).toEqual("saved-keybinding");
  });

  test("Should load a keybinding with a legacy Add Note id", () => {
    const settings = getDefaultSettings();
    settings.Commands = [
      {
        Name: "Add Note",
        KeyBinding: "legacy-keybinding",
        ShowOnActionBar: true
      }
    ];
    Store.Save(Store.User, "Settings", settings);
    const command = new Command(
      "add-tag",
      "Add Tag",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(command.KeyBinding).toEqual("legacy-keybinding");
  });

  test("Should switch legacy Clear Encounter keybinding to Clean Encounter", () => {
    const settings = getDefaultSettings();
    settings.Commands = [
      {
        Name: "Clear Encounter",
        KeyBinding: "legacy-clear-encounter-keybinding",
        ShowOnActionBar: true
      }
    ];
    Store.Save(Store.User, "Settings", settings);
    const clearEncounterCommand = new Command(
      "clear-encounter",
      "Clear Encounter",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(clearEncounterCommand.KeyBinding).toEqual("default-keybinding");

    const cleanEncounterCommand = new Command(
      "clean-encounter",
      "Clean Encounter",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(cleanEncounterCommand.KeyBinding).toEqual(
      "legacy-clear-encounter-keybinding"
    );
  });

  test("Should load a keybinding from the old Store", () => {
    Store.Save(Store.KeyBindings, "Add Note", "legacy-keybinding");
    const command = new Command(
      "add-tag",
      "Add Tag",
      jest.fn(),
      "default-keybinding",
      "square"
    );
    expect(command.KeyBinding).toEqual("legacy-keybinding");
  });
});
