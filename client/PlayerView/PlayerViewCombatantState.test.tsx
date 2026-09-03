import { HpVerbosityOption } from "../../common/PlayerViewSettings";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { CurrentSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";

describe("PlayerViewCombatantState", () => {
  let encounter: Encounter;

  beforeEach(() => {
    InitializeTestSettings();
    encounter = buildEncounter();
  });

  test("Player HP is displayed", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      Player: "player"
    });
    encounter.EncounterFlow.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe("10/10");
    expect(playerViewState.Combatants[0].HealthState).toBe("healthy");
  });

  test("Creature HP is obfuscated", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.EncounterFlow.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe(
      "<span class='healthyHP'>Healthy</span>"
    );
    expect(playerViewState.Combatants[0].HealthState).toBe("healthy");
  });

  test("Creature HP setting actual HP", () => {
    const settings = CurrentSettings();
    settings.PlayerView.MonsterHPVerbosity = HpVerbosityOption.ActualHP;
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.EncounterFlow.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe("10/10");
    expect(playerViewState.Combatants[0].HealthState).toBe("healthy");
  });

  test("Player HP setting obfuscated HP", () => {
    const settings = CurrentSettings();
    settings.PlayerView.PlayerHPVerbosity = HpVerbosityOption.ColoredLabel;
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });
    encounter.EncounterFlow.StartEncounter();
    const playerViewState = encounter.GetPlayerView();
    expect(playerViewState.Combatants[0].HPDisplay).toBe(
      "<span class='healthyHP'>Healthy</span>"
    );
  });

  test.each([HpVerbosityOption.HideAll, HpVerbosityOption.DamageTaken])(
    "Creature health state is omitted when HP is displayed as %s",
    hpVerbosity => {
      const settings = CurrentSettings();
      settings.PlayerView.MonsterHPVerbosity = hpVerbosity;
      encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        HP: { Value: 10, Notes: "" }
      });
      encounter.EncounterFlow.StartEncounter();

      expect(
        encounter.GetPlayerView().Combatants[0].HealthState
      ).toBeUndefined();
    }
  );
});
