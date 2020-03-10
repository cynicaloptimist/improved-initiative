import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { CombatantCommander } from "./CombatantCommander";

describe("CombatantCommander", () => {
  let encounter: Encounter;
  let combatantCommander: CombatantCommander;
  let trackerViewModel: TrackerViewModel;
  beforeEach(() => {
    window["$"] = require("jquery");
    window.confirm = () => true;
    InitializeSettings();

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
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());

    combatant1.Initiative(15);
    combatant2.Initiative(10);
    encounter.SortByInitiative(false);

    expect(trackerViewModel.CombatantViewModels()[0].Combatant).toBe(combatant1);

    const combatantViewModel = trackerViewModel.CombatantViewModels()[0];
    expect(combatantViewModel.Combatant).toBe(combatant1);

    combatantCommander.Select(combatantViewModel);
    combatantViewModel.ApplyInitiative("5");

    expect(trackerViewModel.CombatantViewModels()[1].Combatant).toBe(combatant1);

    expect(combatantCommander.SelectedCombatants()[0]).toBe(
      trackerViewModel.CombatantViewModels()[1]
    );
  });
});
