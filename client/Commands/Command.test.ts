import { getDefaultSettings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import { Command } from "./Command";

describe("Command", () => {
    test("Should use a default keybinding", () => {
        const command = new Command("some-command-id", "Some Command", jest.fn(), "default-keybinding", "square");
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
        
        const command = new Command("some-command-id", "Some Command", jest.fn(), "default-keybinding", "square");
        expect(command.KeyBinding).toEqual("saved-keybinding");
    });

    test("Should load a legacy keybinding", () => {
        Store.Save(Store.KeyBindings, "Add Note", "legacy-keybinding");
        const command = new Command("add-tag", "Add Tag", jest.fn(), "default-keybinding", "square");
        expect(command.KeyBinding).toEqual("legacy-keybinding");
    });
});