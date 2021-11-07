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
});
