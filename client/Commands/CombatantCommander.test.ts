import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { CombatantCommander } from "./CombatantCommander";

describe("EncounterCommander", () => {
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
});
