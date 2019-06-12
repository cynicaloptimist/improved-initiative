import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";
import { CombatFooter } from "./components/CombatFooter";

Enzyme.configure({ adapter: new Adapter() });

describe("Turn Timer", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });
  test("Player View round timer keeps time", () => {
    jest.useFakeTimers();
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      Player: "player"
    });
    encounter.EncounterFlow.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    const combatFooter = Enzyme.shallow(
      <CombatFooter
        currentRound={playerViewState.RoundCounter}
        timerVisible={true}
        activeCombatantId={playerViewState.ActiveCombatantId}
      />
    );
    jest.advanceTimersByTime(10000); // 10 seconds
    expect(combatFooter.find(".turn-timer").text()).toBe("0:10");
  });
  test("Player View round timer stops when encounter stops", () => {
    jest.useFakeTimers();
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      Player: "player"
    });
    encounter.EncounterFlow.StartEncounter();
    encounter.EncounterFlow.EndEncounter();
    const playerViewState = encounter.GetPlayerView();
    const combatFooter = Enzyme.shallow(
      <CombatFooter
        currentRound={playerViewState.RoundCounter}
        timerVisible={true}
        activeCombatantId={playerViewState.ActiveCombatantId}
      />
    );
    jest.advanceTimersByTime(10000); // 10 seconds
    expect(combatFooter.find(".turn-timer").text()).toBe("0:00");
  });
});
