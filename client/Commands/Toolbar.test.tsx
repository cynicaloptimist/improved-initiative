import * as Enzyme from "enzyme";
import * as React from "react";

import { Button } from "../Components/Button";
import { Command } from "./Command";
import { Toolbar } from "./Toolbar";

const renderToolbarWithSingleCommand = (id, description, keyBinding) => {
  const encounterCommands = [
    new Command(id, description, () => {}, keyBinding, "gear")
  ];

  return Enzyme.shallow(
    <Toolbar
      encounterCommands={encounterCommands}
      combatantCommands={[]}
      width="narrow"
      showCombatantCommands={true}
    />
  );
};

describe("Toolbar component", () => {
  test("Button shows the command's description and key binding", () => {
    const id = "test-command";
    const description = "Test command";
    const keyBinding = "alt+t";
    const component = renderToolbarWithSingleCommand(
      id,
      description,
      keyBinding
    );

    const tooltip = component
      .find(Button)
      .first()
      .prop("tooltip");
    expect(tooltip).toEqual(`${description} [${keyBinding}]`);
  });

  test("Button shows the command's description if key binding is blank", () => {
    const id = "test-command";
    const description = "Test command";
    const keyBinding = "";
    const component = renderToolbarWithSingleCommand(
      id,
      description,
      keyBinding
    );

    const tooltip = component
      .find(Button)
      .first()
      .prop("tooltip");
    expect(tooltip).toEqual(description);
  });
});
