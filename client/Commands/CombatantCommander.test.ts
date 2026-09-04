import { fireEvent, render, within } from "@testing-library/react";
import * as React from "react";

import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { PendingPrompts } from "../Prompts/PendingPrompts";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { addCombatantFromStatBlock } from "../test/addCombatant";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { CombatantCommander } from "./CombatantCommander";

describe("CombatantCommander", () => {
  let encounter: Encounter;
  let combatantCommander: CombatantCommander;
  let trackerViewModel: TrackerViewModel;
  beforeEach(() => {
    window.confirm = () => true;

    InitializeTestSettings();

    const mockIo: any = {
      on: jest.fn(),
      emit: jest.fn()
    };

    trackerViewModel = new TrackerViewModel(mockIo);
    encounter = trackerViewModel.Encounter;
    combatantCommander = trackerViewModel.CombatantCommander;
  });

  afterEach(() => {
    encounter.ClearEncounter();
    jest.restoreAllMocks();
  });

  test("Apply Damage", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10 }
    });
    const combatantViewModel = trackerViewModel.CombatantViewModels()[0];
    expect(combatantViewModel.HP()).toEqual("10/10");
    combatantViewModel.ApplyDamage("5");
    expect(combatantViewModel.HP()).toEqual("5/10");
  });

  test("Toggle Hidden", () => {
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatantViewModel = trackerViewModel.CombatantViewModels()[0];

    const playerViewBeforeToggle = encounter.GetPlayerView();
    expect(playerViewBeforeToggle.Combatants).toHaveLength(1);

    combatantCommander.Select(combatantViewModel);
    combatantCommander.ToggleHidden();
    const playerView = encounter.GetPlayerView();

    expect(playerView.Combatants).toHaveLength(0);
  });

  test("Toggle Reveal AC", () => {
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatantViewModel = trackerViewModel.CombatantViewModels()[0];

    const playerViewBeforeToggle = encounter.GetPlayerView();
    expect(playerViewBeforeToggle.Combatants[0].AC).toBeUndefined();

    combatantCommander.Select(combatantViewModel);
    combatantCommander.ToggleRevealedAC();
    const playerView = encounter.GetPlayerView();

    expect(playerView.Combatants[0].AC).toBe(10);
  });

  test("Should maintain selection when initiative order changes", () => {
    const combatant1 = addCombatantFromStatBlock(encounter);
    const combatant2 = addCombatantFromStatBlock(encounter);

    combatant1.Initiative(15);
    combatant2.Initiative(10);
    encounter.SortByInitiative(false);

    expect(trackerViewModel.CombatantViewModels()[0].Combatant).toBe(
      combatant1
    );

    const combatantViewModel = trackerViewModel.CombatantViewModels()[0];
    expect(combatantViewModel.Combatant).toBe(combatant1);

    combatantCommander.Select(combatantViewModel);
    combatantViewModel.ApplyInitiative(5);

    expect(trackerViewModel.CombatantViewModels()[1].Combatant).toBe(
      combatant1
    );

    expect(combatantCommander.SelectedCombatants()[0]).toBe(
      trackerViewModel.CombatantViewModels()[1]
    );
  });

  test("rerolls the original dice expression", () => {
    const trackEvent = jest.spyOn(Metrics, "TrackEvent").mockImplementation();
    const random = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0.999999);

    try {
      combatantCommander.RollDice("2d6 + 3");
      const rendered = render(
        React.createElement(PendingPrompts, {
          promptsAndIds: trackerViewModel.PromptQueue.GetPrompts(),
          removePrompt: jest.fn()
        })
      );
      const prompt =
        rendered.container.querySelector<HTMLFormElement>("form.prompt")!;

      expect(within(prompt).getByText("Rolled 2d6 + 3")).toBeTruthy();
      expect(
        Array.from(prompt.querySelectorAll(".p-roll-dice-result__roll")).map(
          roll => roll.textContent
        )
      ).toEqual(["1", "2"]);

      fireEvent.click(within(prompt).getByRole("button", { name: "Reroll" }));

      expect(within(prompt).getByText("Rolled 2d6 + 3")).toBeTruthy();
      expect(
        Array.from(prompt.querySelectorAll(".p-roll-dice-result__roll")).map(
          roll => roll.textContent
        )
      ).toEqual(["6", "6"]);
      expect(trackEvent.mock.calls).toEqual([
        [
          Metrics.Event.DiceRolled,
          { expression: "2d6+3", result: "[1,2] + 3 = 6" }
        ],
        [
          Metrics.Event.DiceRolled,
          { expression: "2d6+3", result: "[6,6] + 3 = 15" }
        ]
      ]);
    } finally {
      random.mockRestore();
    }
  });

  test("records the selected roll mode", () => {
    const trackEvent = jest.spyOn(Metrics, "TrackEvent").mockImplementation();
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce((10 - 0.5) / 20)
      .mockReturnValue(0.999999);
    combatantCommander.RollDice("1d20 + 2");
    const rendered = render(
      React.createElement(PendingPrompts, {
        promptsAndIds: trackerViewModel.PromptQueue.GetPrompts(),
        removePrompt: jest.fn()
      })
    );

    fireEvent.click(rendered.getByRole("button", { name: "Add advantage" }));

    expect(trackEvent).toHaveBeenLastCalledWith(Metrics.Event.DiceRolled, {
      expression: "adv:1d20+2",
      result: "[10,20]a + 2 = 22"
    });
  });
});
