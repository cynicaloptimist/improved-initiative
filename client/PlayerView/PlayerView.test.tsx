import { fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { Tag } from "../Combatant/Tag";
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

  test("Stable hooks expose visible combatant styling state", () => {
    const combatant = addCombatantFromStatBlock(encounter, {
      ...StatBlock.Default(),
      Name: "Hook Sentinel",
      HP: { Value: 10, Notes: "" }
    });
    combatant.Color("#123456");
    combatant.Tags.push(new Tag("Concentrating", combatant, false));
    encounter.EncounterFlow.StartEncounter();

    const settings = CurrentSettings();
    settings.PlayerView.DisplayCombatantColor = true;
    const playerView = render(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
        settings={settings.PlayerView}
      />
    );

    const combatantElement = playerView.container.querySelector(
      '[data-ii-role="combatant"]'
    ) as HTMLElement;
    expect(combatantElement.dataset.iiHealth).toBe("healthy");
    expect(
      combatantElement.style.getPropertyValue(
        "--ii-player-view-combatant-color"
      )
    ).toBe("#123456");

    const tagElement = combatantElement.querySelector(
      "[data-ii-tag]"
    ) as HTMLElement;
    expect(tagElement.getAttribute("data-ii-tag")).toBe("concentrating");
    expect(tagElement.getAttribute("data-tag")).toBe("concentrating");

    settings.PlayerView.DisplayCombatantColor = false;
    playerView.rerender(
      <PlayerView
        {...playerViewProps}
        encounterState={encounter.GetPlayerView()}
        settings={settings.PlayerView}
      />
    );
    expect(
      combatantElement.style.getPropertyValue(
        "--ii-player-view-combatant-color"
      )
    ).toBe("");
    expect(combatantElement.querySelector(".combatant__color")).toBeNull();
  });

  test("Managed custom styles map to Player View theme properties", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Name: "Styled Combatant",
      HP: { Value: 10, Notes: "" }
    });
    encounter.EncounterFlow.StartEncounter();

    const settings = CurrentSettings();
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

    const themeRule = rules.find(rule => rule.selectorText == ":root")!;
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-main-background")
    ).toBe("#101010");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-background-image")
    ).toBe("url(https://example.com/background.png)");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-combatant-background")
    ).toBe("#202020");
    expect(
      themeRule.style.getPropertyValue(
        "--ii-player-view-combatant-zebra-background"
      )
    ).toBe("hsl(0, 0%, 13.8%)");
    expect(
      themeRule.style.getPropertyValue(
        "--ii-player-view-active-combatant-background"
      )
    ).toBe("hsl(0, 0%, 15.1%)");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-combatant-text")
    ).toBe("#303030");
    expect(
      themeRule.style.getPropertyValue(
        "--ii-player-view-active-combatant-indicator"
      )
    ).toBe("#404040");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-header-background")
    ).toBe("#505050");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-header-text")
    ).toBe("#606060");
    expect(
      themeRule.style.getPropertyValue("--ii-player-view-font-family")
    ).toBe('"Custom Font", sans-serif');
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
