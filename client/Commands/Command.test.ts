import { Store } from "../Utility/Store";
import { Command } from "./Command";

describe("Command", () => {
    test("Should use a default keybinding", () => {
        const command = new Command("some-command-id", "Some Command", jest.fn(), "default-keybinding", "square");
        expect(command.KeyBinding).toEqual("default-keybinding");
    });

    test("Should load a saved keybinding", () => {
        Store.Save(Store.KeyBindings, "some-command-id", "saved-keybinding");
        const command = new Command("some-command-id", "Some Command", jest.fn(), "default-keybinding", "square");
        expect(command.KeyBinding).toEqual("saved-keybinding");
    });

    test("Should load a saved keybinding", () => {
        Store.Save(Store.KeyBindings, "Add Note", "legacy-keybinding");
        const command = new Command("add-tag", "Add Tag", jest.fn(), "default-keybinding", "square");
        expect(command.KeyBinding).toEqual("legacy-keybinding");
    });
});