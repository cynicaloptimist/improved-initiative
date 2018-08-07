import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { Command } from "../Command";
import { Toolbar } from "./Toolbar";

Enzyme.configure({ adapter: new Adapter() });

const renderToolbarWithSingleCommand = (description, keyBinding) => {
    const encounterCommands = [
        new Command(description, () => {}, keyBinding, "gear")
    ];

    return Enzyme.render(
        <Toolbar
            encounterCommands={encounterCommands}
            combatantCommands={[]}
            width="narrow"
            showCombatantCommands={true}
        />);
};

describe("Toolbar component", () => {
    test("Button shows the command's description and key binding", () => {
        const description = "Test command";
        const keyBinding = "alt+t";
        const component = renderToolbarWithSingleCommand(description, keyBinding);

        const tooltip = component.find(".c-button").first().prop("title");
        expect(tooltip).toEqual(`${description} [${keyBinding}]`);
    });

    test("Button shows the command's description if key binding is blank", () => {
        const description = "Test command";
        const keyBinding = "";
        const component = renderToolbarWithSingleCommand(description, keyBinding);

        const tooltip = component.find(".c-button").first().prop("title");
        expect(tooltip).toEqual(description);
    });
});
