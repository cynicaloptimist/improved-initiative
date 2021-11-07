import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { buildEncounter } from "../test/buildEncounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";

describe("PlayerView State", () => {
  let encounter: Encounter;

  beforeEach(() => {
    InitializeTestSettings();
    encounter = buildEncounter();
  });

  test("NPC HP is shown as qualitative indicator", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10 }
    });

    const combatantHP10 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP10.HPDisplay).toEqual(
      "<span class='healthyHP'>Healthy</span>"
    );

    combatant.ApplyDamage(1);
    const combatantHP9 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP9.HPDisplay).toEqual("<span class='hurtHP'>Hurt</span>");

    combatant.ApplyDamage(5);
    const combatantHP5 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP5.HPDisplay).toEqual(
      "<span class='bloodiedHP'>Bloodied</span>"
    );

    combatant.ApplyDamage(5);
    const combatantHP0 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP0.HPDisplay).toEqual(
      "<span class='defeatedHP'>Defeated</span>"
    );
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
    encounter.EncounterFlow.StartEncounter();

    let playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant1.Id);

    encounter.EncounterFlow.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant2.Id);

    encounter.EncounterFlow.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant2.Id);

    encounter.EncounterFlow.NextTurn(jest.fn());
    playerViewState = encounter.GetPlayerView();
    expect(playerViewState.ActiveCombatantId).toEqual(visibleCombatant1.Id);
  });
});
