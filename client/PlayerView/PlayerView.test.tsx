import { fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { env } from "../Environment";
import { CurrentSettings } from "../Settings/Settings";
import { addCombatantFromStatBlock } from "../test/addCombatant";
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

  afterEach(() => document.body.removeAttribute("id"));

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

  test("Managed custom style selectors match Player View elements", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Name: "Styled Combatant",
      HP: { Value: 10, Notes: "" }
    });
    encounter.EncounterFlow.StartEncounter();

    const settings = CurrentSettings();
    settings.PlayerView.DisplayRoundCounter = true;
    settings.PlayerView.CustomStyles = {
      mainBackground: "#101010",
      combatantBackground: "#202020",
      combatantText: "#303030",
      activeCombatantIndicator: "#404040",
      headerBackground: "#505050",
      headerText: "#606060",
      backgroundUrl: "https://example.com/background.png",
      font: "Custom Font"
    };
    document.body.id = "playerview";

    const playerView = render(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
        settings={settings.PlayerView}
      />
    );

    const managedStyles = playerView.container.querySelector("style");
    const rules = Array.from(managedStyles.sheet.cssRules) as CSSStyleRule[];

    rules.forEach(rule => {
      rule.selectorText.split(",").forEach(selector => {
        expect(document.querySelector(selector.trim())).toBeTruthy();
      });
    });

    expect(
      rules.some(
        rule =>
          rule.selectorText == "#playerview .combatant.active" &&
          rule.style.getPropertyValue("border-left-color") == "#404040"
      )
    ).toBe(true);
    expect(
      rules.some(
        rule =>
          rule.selectorText ==
            "#playerview .combatant--header, #playerview .combat-footer" &&
          rule.style.getPropertyValue("color") == "#606060"
      )
    ).toBe(true);
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
    const combatant1 = addCombatantFromStatBlock(encounter, {
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

  test("Should suggest simple tags", async () => {
    const playerView = render(
      <PlayerView
        settings={CurrentSettings().PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={suggestTag}
      />
    );

    suggestTag.mockImplementation((combatantId: string, tagState: TagState) => {
      expect(combatantId).toEqual(encounter.Combatants()[0].Id);
      expect(tagState.Text).toEqual("Dazed");
      expect(tagState.DurationTiming).toBeNull();
    });

    playerView.getByTitle("Suggest a Tag").click();
    fireEvent.change(
      playerView.container.querySelector("input[name='tagText']"),
      {
        target: { value: "Dazed" }
      }
    );
    fireEvent.submit(playerView.container.querySelector("form.tag-suggestion"));

    await waitFor(() => expect(suggestTag).toHaveBeenCalledTimes(1));
  });
});
