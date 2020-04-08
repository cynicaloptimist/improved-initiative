import * as Enzyme from "enzyme";
import * as React from "react";

import { Button } from "../Components/Button";
import { Command } from "./Command";
import { Toolbar } from "./Toolbar";
import { CommandButton } from "./CommandButton";

const renderToolbarWithSingleCommand = (
  id,
  description,
  width: "narrow" | "wide" = "narrow"
) => {
  const encounterCommands = [
    new Command({
      id: id,
      description: description,
      actionBinding: () => {},
      fontAwesomeIcon: "gear"
    })
  ];

  return Enzyme.shallow(
    <Toolbar
      encounterCommands={encounterCommands}
      combatantCommands={[]}
      width={width}
      showCombatantCommands={true}
    />
  );
};

describe("Toolbar component", () => {
  test("Button shows the command's description and key binding", () => {
    const id = "start-encounter";
    const description = "Test command";
    const component = renderToolbarWithSingleCommand(id, description);

    const tooltip = component
      .find(CommandButton)
      .first()
      .dive()
      .find(Button)
      .prop("tooltip");
    expect(tooltip).toEqual(`${description} [alt+r]`);
  });

  test("Button shows the command's description if key binding is blank", () => {
    const id = "test-command";
    const description = "Test command";
    const component = renderToolbarWithSingleCommand(id, description);

    const tooltip = component
      .find(CommandButton)
      .first()
      .dive()
      .find(Button)
      .prop("tooltip");
    expect(tooltip).toEqual(description);
  });

  test("Button shows label when toolbar is wide", () => {
    const id = "test-command";
    const description = "Test command";
    const component = renderToolbarWithSingleCommand(id, description, "wide");

    const label = component
      .find(CommandButton)
      .first()
      .dive()
      .find(Button)
      .prop("text");
    expect(label).toEqual(description);
  });
});
