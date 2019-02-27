import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";

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
