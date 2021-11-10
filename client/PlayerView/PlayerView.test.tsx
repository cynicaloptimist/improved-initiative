import { fireEvent, render } from "@testing-library/react";
import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { env } from "../Environment";
import { CurrentSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { PlayerView, PlayerViewProps } from "./components/PlayerView";

describe("PlayerViewModel", () => {
  let encounter: Encounter;
  let playerViewProps: PlayerViewProps;
  beforeEach(() => {
    InitializeTestSettings();

    encounter = buildEncounter();
    playerViewProps = {
      settings: CurrentSettings().PlayerView,
      encounterState: encounter.GetPlayerView(),
      onSuggestDamage: jest.fn(),
      onSuggestTag: jest.fn()
    };
  });

  test("Loading the encounter populates combatants", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Name: "Test Combatant 1",
      HP: { Value: 10, Notes: "" }
    });

    const playerView = render(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
      />
    );

    expect(playerView.getByText("Test Combatant 1")).toBeTruthy();
  });

  test("Starting the encounter splashes combatant portraits when available", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant1.png"
    });
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant2.png"
    });

    env.HasEpicInitiative = true;
    const settings = CurrentSettings();
    settings.PlayerView.DisplayPortraits = true;
    settings.PlayerView.SplashPortraits = true;

    const playerView = render(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
        settings={settings.PlayerView}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeFalsy();

    encounter.EncounterFlow.StartEncounter();

    playerView.rerender(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
        settings={settings.PlayerView}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeTruthy();
  });

  test("Making no change does not splash combatant portraits", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant1.png"
    });
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant2.png"
    });
    encounter.EncounterFlow.StartEncounter();

    env.HasEpicInitiative = true;
    const settings = CurrentSettings();
    settings.PlayerView.DisplayPortraits = true;
    settings.PlayerView.SplashPortraits = true;

    const playerView = render(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeFalsy();

    playerView.rerender(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeFalsy();
  });

  test("Applying damage does not splash combatant portraits", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant1.png"
    });
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      ImageURL: "http://combatant2.png"
    });
    encounter.EncounterFlow.StartEncounter();

    env.HasEpicInitiative = true;
    const settings = CurrentSettings();
    settings.PlayerView.DisplayPortraits = true;
    settings.PlayerView.SplashPortraits = true;

    const playerView = render(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeFalsy();

    combatant1.ApplyDamage(5);
    playerView.rerender(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.queryByTestId("combatant-portrait")).toBeFalsy();
  });
});

describe("Tag Suggestor", () => {
  let encounter: Encounter;
  let suggestTag: jest.Mock<void>;

  beforeEach(() => {
    InitializeTestSettings({
      PlayerView: {
        AllowTagSuggestions: true
      }
    });

    encounter = buildEncounter();
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    suggestTag = jest.fn(() => {
      console.log("suggestTag");
    });
  });

  test.skip("Should suggest simple tags", done => {
    const playerView = render(
      <PlayerView
        settings={CurrentSettings().PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={suggestTag}
      />
    );

    expect.assertions(3);

    suggestTag.mockImplementation((combatantId: string, tagState: TagState) => {
      expect(combatantId).toEqual(encounter.Combatants()[0].Id);
      expect(tagState.Text).toEqual("Dazed");
      expect(tagState.DurationTiming).toBeNull();
      done();
    });

    playerView.getByAltText("Add Tag").click();
    fireEvent.change(playerView.getByTestId("tag-text"), {
      target: { value: "Dazed" }
    });
    fireEvent.submit(playerView.getByRole("form"));
  });
});
