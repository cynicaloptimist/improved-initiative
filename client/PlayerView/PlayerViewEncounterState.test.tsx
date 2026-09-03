import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { addCombatantFromStatBlock } from "../test/addCombatant";
import { buildEncounter } from "../test/buildEncounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";

describe("PlayerView State", () => {
  let encounter: Encounter;

  beforeEach(() => {
    InitializeTestSettings();
    encounter = buildEncounter();
  });

  test("NPC HP is shown as qualitative indicator", () => {
    const combatant = addCombatantFromStatBlock(encounter, {
      ...StatBlock.Default(),
      HP: { Value: 10 }
    });

    const combatantHP10 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP10.HPDisplay).toEqual(
      "<span class='healthyHP'>Healthy</span>"
    );
    expect(combatantHP10.HealthState).toEqual("healthy");

    combatant.ApplyDamage(1);
    const combatantHP9 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP9.HPDisplay).toEqual("<span class='hurtHP'>Hurt</span>");
    expect(combatantHP9.HealthState).toEqual("hurt");

    combatant.ApplyDamage(5);
    const combatantHP5 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP5.HPDisplay).toEqual(
      "<span class='bloodiedHP'>Bloodied</span>"
    );
    expect(combatantHP5.HealthState).toEqual("bloodied");

    combatant.ApplyDamage(5);
    const combatantHP0 = encounter.GetPlayerView().Combatants[0];
    expect(combatantHP0.HPDisplay).toEqual(
      "<span class='defeatedHP'>Defeated</span>"
    );
    expect(combatantHP0.HealthState).toEqual("defeated");
  });

  test("Player View is only updated if next combatant is visible", () => {
    const visibleCombatant1 = addCombatantFromStatBlock(encounter);
    visibleCombatant1.Initiative(20);
    const visibleCombatant2 = addCombatantFromStatBlock(encounter);
    visibleCombatant2.Initiative(10);
    const hiddenCombatant = addCombatantFromStatBlock(encounter);
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
