import { fireEvent, render } from "@testing-library/react";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { getDefaultSettings } from "../../common/Settings";
import { StatBlock } from "../../common/StatBlock";
import { Command } from "../Commands/Command";
import { DefaultRules } from "../Rules/Rules";
import { SettingsContext } from "../Settings/SettingsContext";
import {
  TextEnricher,
  TextEnricherContext
} from "../TextEnricher/TextEnricher";
import { CombatantRow } from "./CombatantRow";
import { CommandContext } from "./CommandContext";

jest.mock("react-dnd", () => ({
  useDrag: () => [{}, jest.fn()],
  useDrop: () => [{ id: null, initiativeIndex: null }, jest.fn()]
}));

function getCombatantState(
  overrides: Partial<CombatantState> = {}
): CombatantState {
  const statBlock = StatBlock.Default();
  return {
    Id: "combatant-id",
    StatBlock: statBlock,
    CurrentHP: statBlock.HP.Value,
    TemporaryHP: 0,
    Initiative: 10,
    Alias: "",
    IndexLabel: null,
    Tags: [],
    Hidden: false,
    RevealedAC: false,
    InterfaceVersion: "test",
    ...overrides
  };
}

function getCommandContext(
  overrides: Partial<React.ContextType<typeof CommandContext>> = {}
): React.ContextType<typeof CommandContext> {
  return {
    SelectCombatant: jest.fn(),
    RemoveTagFromCombatant: jest.fn(),
    ApplyDamageToCombatant: jest.fn(),
    MoveCombatantFromDrag: jest.fn(),
    SetCombatantColor: jest.fn(),
    ToggleCombatantSpentReaction: jest.fn(),
    CombatantsPendingRemove: [],
    RestoreCombatants: jest.fn(),
    FlushCombatants: jest.fn(),
    CombatantCommands: [],
    ...overrides
  };
}

function renderCombatantRow(options?: {
  combatantState?: CombatantState;
  commandContext?: React.ContextType<typeof CommandContext>;
  displayReactionTracker?: boolean;
  textEnricher?: TextEnricher;
}) {
  const settings = getDefaultSettings();
  settings.TrackerView.DisplayReactionTracker =
    options?.displayReactionTracker || false;

  const row = (
    <CommandContext.Provider
      value={options?.commandContext || getCommandContext()}
    >
      <SettingsContext.Provider value={settings}>
        <table>
          <tbody>
            <CombatantRow
              combatantState={options?.combatantState || getCombatantState()}
              isActive={false}
              isSelected
              showIndexLabel={false}
              initiativeIndex={0}
            />
          </tbody>
        </table>
      </SettingsContext.Provider>
    </CommandContext.Provider>
  );

  if (options?.textEnricher) {
    return render(
      <TextEnricherContext.Provider value={options.textEnricher}>
        {row}
      </TextEnricherContext.Provider>
    );
  }
  return render(row);
}

describe("CombatantRow", () => {
  test("does not select the combatant when an inline command is clicked", () => {
    const selectCombatant = jest.fn();
    const runCommand = jest.fn();
    const command = new Command({
      id: "link-initiative",
      description: "Link Initiative",
      actionBinding: runCommand,
      fontAwesomeIcon: "link",
      defaultShowInCombatantRow: true
    });
    const rendered = renderCombatantRow({
      commandContext: getCommandContext({
        SelectCombatant: selectCombatant,
        CombatantCommands: [command]
      })
    });

    fireEvent.click(rendered.getByRole("button", { name: "Link Initiative" }));

    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(selectCombatant).not.toHaveBeenCalled();
  });

  test.each([undefined, 1])(
    "does not select the combatant when toggling reaction state %s",
    reactionsSpent => {
      const selectCombatant = jest.fn();
      const toggleReaction = jest.fn();
      const rendered = renderCombatantRow({
        combatantState: getCombatantState({ ReactionsSpent: reactionsSpent }),
        commandContext: getCommandContext({
          SelectCombatant: selectCombatant,
          ToggleCombatantSpentReaction: toggleReaction
        }),
        displayReactionTracker: true
      });

      fireEvent.click(
        rendered.container.querySelector(".combatant__reaction-icon")!
      );

      expect(toggleReaction).toHaveBeenCalledWith("combatant-id");
      expect(selectCombatant).not.toHaveBeenCalled();
    }
  );

  test("does not select the combatant when opening a condition reference", () => {
    const selectCombatant = jest.fn();
    const referenceCondition = jest.fn();
    const textEnricher = new TextEnricher(
      jest.fn(),
      jest.fn(),
      referenceCondition,
      () => [],
      () => new RegExp("$^"),
      new DefaultRules()
    );
    const rendered = renderCombatantRow({
      combatantState: getCombatantState({
        Tags: [
          {
            Text: "Prone",
            DurationRemaining: -1,
            DurationTiming: "StartOfTurn",
            DurationCombatantId: ""
          }
        ]
      }),
      commandContext: getCommandContext({ SelectCombatant: selectCombatant }),
      textEnricher
    });

    fireEvent.click(rendered.container.querySelector(".condition-reference")!);

    expect(referenceCondition).toHaveBeenCalledWith("Prone");
    expect(selectCombatant).not.toHaveBeenCalled();
  });

  test("still selects the combatant when plain tag text is clicked", () => {
    const selectCombatant = jest.fn();
    const rendered = renderCombatantRow({
      combatantState: getCombatantState({
        Tags: [
          {
            Text: "Concentrating",
            DurationRemaining: -1,
            DurationTiming: "StartOfTurn",
            DurationCombatantId: ""
          }
        ]
      }),
      commandContext: getCommandContext({ SelectCombatant: selectCombatant })
    });

    fireEvent.click(rendered.container.querySelector(".tag__text")!);

    expect(selectCombatant).toHaveBeenCalledWith("combatant-id", false);
  });

  test("selects the combatant when the row itself is clicked", () => {
    const selectCombatant = jest.fn();
    const rendered = renderCombatantRow({
      commandContext: getCommandContext({ SelectCombatant: selectCombatant })
    });

    fireEvent.click(rendered.getByRole("row"));

    expect(selectCombatant).toHaveBeenCalledWith("combatant-id", false);
  });
});
