import { fireEvent, render, within } from "@testing-library/react";
import * as React from "react";
import { act } from "react-dom/test-utils";

import { Combatant } from "../Combatant/Combatant";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { InitiativePrompt } from "./InitiativePrompt";
import { PendingPrompts } from "./PendingPrompts";

function MockCombatant(id: string, isPlayerCharacter: boolean): Combatant {
  return {
    Id: id,
    DisplayName: () => id,
    GetInitiativeRoll: jest.fn(() => ({ rolls: [10], finalValue: 10 })),
    InitiativeBonus: () => 0,
    InitiativeGroup: () => null,
    IsPlayerCharacter: () => isPlayerCharacter,
    StatBlock: () => ({ InitiativeSpecialRoll: undefined })
  } as unknown as Combatant;
}

describe("InitiativePrompt", () => {
  beforeEach(() => {
    InitializeTestSettings();
  });

  test("shows the initiative mode controls for both combatant sides", () => {
    const prompt = InitiativePrompt(
      [MockCombatant("PC", true), MockCombatant("Enemy", false)],
      jest.fn()
    );
    const rendered = render(
      <PendingPrompts
        promptsAndIds={[[prompt, "initiative"]]}
        removePrompt={jest.fn()}
      />
    );
    const sides = rendered.container.querySelectorAll<HTMLElement>(
      ".roll-initiative__side"
    );
    const playerButtons = within(sides[0]).getAllByRole("button");
    const enemyButtons = within(sides[1]).getAllByRole("button");

    expect(playerButtons.map(button => button.textContent)).toEqual(["A", "D"]);
    expect(enemyButtons.map(button => button.textContent)).toEqual(["A", "D"]);
    expect(
      playerButtons.every(button =>
        button.classList.contains("roll-initiative__mode-button--hexagon")
      )
    ).toBe(true);
    expect(
      playerButtons.every(
        button => button.querySelector(".fa-dice-d20") === null
      )
    ).toBe(true);
    expect(
      enemyButtons.every(
        button => button.querySelector(".fa-dice-d20") !== null
      )
    ).toBe(true);
  });

  test("applies a selected mode only to that combatant side", async () => {
    const player = MockCombatant("PC", true);
    const enemy = MockCombatant("Enemy", false);
    const prompt = InitiativePrompt([player, enemy], jest.fn());
    const rendered = render(
      <PendingPrompts
        promptsAndIds={[[prompt, "initiative"]]}
        removePrompt={jest.fn()}
      />
    );
    const sides = rendered.container.querySelectorAll<HTMLElement>(
      ".roll-initiative__side"
    );

    await act(async () => {
      fireEvent.click(within(sides[0]).getByRole("button", { name: "A" }));
    });

    expect(within(sides[0]).getByText("Rerolled with advantage.")).toBeTruthy();
    expect(within(sides[0]).queryByRole("button", { name: "A" })).toBeNull();
    expect(within(sides[1]).getByRole("button", { name: "A" })).toBeTruthy();
    expect(player.GetInitiativeRoll).toHaveBeenCalledTimes(2);
    expect(enemy.GetInitiativeRoll).toHaveBeenCalledTimes(1);
  });
});
