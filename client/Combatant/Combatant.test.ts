import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { buildEncounter } from "../test/buildEncounter";
import { ToPlayerViewCombatantState } from "./ToPlayerViewCombatantState";

describe("Combatant", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeTestSettings();
    encounter = buildEncounter();
  });

  test("Should have its Max HP set from the statblock", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });

    expect(combatant.MaxHP()).toBe(10);
  });

  test("Should update its Max HP when its statblock is updated", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Player: "player"
    });

    combatant.StatBlock({
      ...StatBlock.Default(),
      HP: { Value: 15, Notes: "" }
    });
    expect(combatant.MaxHP()).toBe(15);
  });

  test("Should notify the encounter when its statblock is updated", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Player: "player"
    });
    const combatantsSpy = jest.fn();
    encounter.Combatants.subscribe(combatantsSpy);

    combatant.StatBlock({
      ...StatBlock.Default(),
      HP: { Value: 15, Notes: "" }
    });
    expect(combatantsSpy).toBeCalled();
  });

  describe("ToPlayerViewCombatantState", () => {
    test("Should show full HP for player characters", () => {
      const combatant = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        Player: "player"
      });
      const playerViewCombatantState = ToPlayerViewCombatantState(combatant);
      expect(playerViewCombatantState.HPDisplay).toEqual("1/1");
    });

    test("Should show qualitative HP for creatures", () => {
      const combatant = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default()
      });
      const playerViewCombatantState = ToPlayerViewCombatantState(combatant);
      expect(playerViewCombatantState.HPDisplay).toEqual(
        "<span class='healthyHP'>Healthy</span>"
      );
    });
  });
});
