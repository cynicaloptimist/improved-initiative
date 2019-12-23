import * as Enzyme from "enzyme";
import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { env } from "../Environment";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";
import { PlayerView } from "./components/PlayerView";
import { PlayerViewCombatant } from "./components/PlayerViewCombatant";
import { PortraitWithCaption } from "./components/PortraitModal";

describe("PlayerViewModel", () => {
  let encounter: Encounter;
  let playerView: Enzyme.ShallowWrapper;

  beforeEach(() => {
    InitializeSettings();

    encounter = buildEncounter();
    playerView = Enzyme.shallow(
      <PlayerView
        settings={CurrentSettings().PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );
  });

  test("Loading the encounter populates combatants", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });

    playerView.setProps({ encounterState: encounter.GetPlayerView() });

    expect(playerView.find(PlayerViewCombatant).length).toBe(1);
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

    playerView.setProps({
      encounterState: encounter.GetPlayerView(),
      settings: settings.PlayerView
    });

    expect(playerView.find(PortraitWithCaption).length).toBe(0);

    encounter.EncounterFlow.StartEncounter();
    playerView.setProps({ encounterState: encounter.GetPlayerView() });

    expect(playerView.find(PortraitWithCaption).length).toBe(1);
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

    playerView = Enzyme.shallow(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.find(PortraitWithCaption).length).toBe(0);

    playerView.setProps({
      encounterState: encounter.GetPlayerView()
    });

    expect(playerView.find(PortraitWithCaption).length).toBe(0);
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

    playerView = Enzyme.shallow(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={jest.fn()}
      />
    );

    expect(playerView.find(PortraitWithCaption).length).toBe(0);

    combatant1.ApplyDamage(5);
    playerView.setProps({
      encounterState: encounter.GetPlayerView()
    });

    expect(playerView.find(PortraitWithCaption).length).toBe(0);
  });
});

describe("Tag Suggestor", () => {
  let encounter: Encounter;
  let suggestTag: jest.Mock<void>;
  let playerView: Enzyme.ReactWrapper<
    any,
    Readonly<{}>,
    React.Component<{}, {}, any>
  >;

  beforeEach(() => {
    InitializeSettings();
    const playerViewSettings = CurrentSettings().PlayerView;
    playerViewSettings.AllowTagSuggestions = true;

    encounter = buildEncounter();
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    suggestTag = jest.fn(() => {
      console.log("suggestTag");
    });
    playerView = Enzyme.mount(
      <PlayerView
        settings={playerViewSettings}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
        onSuggestTag={suggestTag}
      />
    );
  });

  test("Should suggest simple tags", done => {
    expect.assertions(3);

    suggestTag.mockImplementation((combatantId: string, tagState: TagState) => {
      expect(combatantId).toEqual(encounter.Combatants()[0].Id);
      expect(tagState.Text).toEqual("Dazed");
      expect(tagState.DurationTiming).toBeNull();
      done();
    });

    playerView
      .find(".combatant__add-tag-button .fa-clickable")
      .simulate("click");
    playerView
      .find(`.tag-suggestion input[name="tagText"]`)
      .simulate("change", { target: { name: "tagText", value: "Dazed" } });
    playerView.find("form").simulate("submit");
  });
});
