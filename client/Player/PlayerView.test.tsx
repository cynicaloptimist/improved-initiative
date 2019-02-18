import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { HpVerbosityOption } from "../../common/PlayerViewSettings";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { env } from "../Environment";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";
import { CombatFooter } from "./components/CombatFooter";
import { PlayerView } from "./components/PlayerView";
import { PlayerViewCombatant } from "./components/PlayerViewCombatant";
import { PortraitModal } from "./components/PortraitModal";

Enzyme.configure({ adapter: new Adapter() });

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

    expect(playerView.find(PortraitModal).length).toBe(0);

    encounter.StartEncounter();
    playerView.setProps({ encounterState: encounter.GetPlayerView() });

    expect(playerView.find(PortraitModal).length).toBe(1);
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
    encounter.StartEncounter();

    env.HasEpicInitiative = true;
    const settings = CurrentSettings();
    settings.PlayerView.DisplayPortraits = true;
    settings.PlayerView.SplashPortraits = true;

    playerView = Enzyme.shallow(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
      />
    );

    expect(playerView.find(PortraitModal).length).toBe(0);

    playerView.setProps({
      encounterState: encounter.GetPlayerView()
    });

    expect(playerView.find(PortraitModal).length).toBe(0);
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
    encounter.StartEncounter();

    env.HasEpicInitiative = true;
    const settings = CurrentSettings();
    settings.PlayerView.DisplayPortraits = true;
    settings.PlayerView.SplashPortraits = true;

    playerView = Enzyme.shallow(
      <PlayerView
        settings={settings.PlayerView}
        encounterState={encounter.GetPlayerView()}
        onSuggestDamage={jest.fn()}
      />
    );

    expect(playerView.find(PortraitModal).length).toBe(0);

    combatant1.ApplyDamage(5);
    playerView.setProps({
      encounterState: encounter.GetPlayerView()
    });

    expect(playerView.find(PortraitModal).length).toBe(0);
  });
});

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
    encounter.StartEncounter();
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
    encounter.StartEncounter();
    encounter.EndEncounter();
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

describe("PlayerView State", () => {
  let encounter: Encounter;

  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });

  test("Player View is only updated if next combatant is visible", () => {
    const visibleCombatant1 = encounter.AddCombatantFromStatBlock(
      StatBlock.Default()
    );
    visibleCombatant1.Initiative(20);

    const visibleCombatant2 = encounter.AddCombatantFromStatBlock(
      StatBlock.Default()
    );
    visibleCombatant2.Initiative(10);

    const hiddenCombatant = encounter.AddCombatantFromStatBlock(
      StatBlock.Default()
    );
    hiddenCombatant.Hidden(true);
    hiddenCombatant.Initiative(1);

    encounter.StartEncounter();
    let playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant1.Id);

    encounter.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant2.Id);

    encounter.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant2.Id);

    encounter.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant1.Id);
  });
});

describe("PlayerViewCombatantState HP Display", () => {
  let encounter: Encounter;

  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });

  test("Player HP is displayed", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      Player: "player"
    });
    encounter.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe("10/10");
  });

  test("Creature HP is obfuscated", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe(
      "<span class='healthyHP'>Healthy</span>"
    );
  });

  test("Creature HP setting actual HP", () => {
    const settings = CurrentSettings();
    settings.PlayerView.MonsterHPVerbosity = HpVerbosityOption.ActualHP;

    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe("10/10");
  });

  test("Player HP setting obfuscated HP", () => {
    const settings = CurrentSettings();
    settings.PlayerView.PlayerHPVerbosity = HpVerbosityOption.ColoredLabel;

    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe(
      "<span class='healthyHP'>Healthy</span>"
    );
  });
});
