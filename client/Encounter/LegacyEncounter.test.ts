import {
  UpdateLegacyEncounterState,
  UpdateLegacySavedEncounter
} from "./UpdateLegacySavedEncounter";

function makev0_1StatBlock() {
  return {
    Name: "v0.1 Creature",
    Type: "",
    HP: { Value: 1 },
    AC: { Value: 10 },
    Speed: ["Walk 30"],
    Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
    DamageVulnerabilities: [],
    DamageResistances: [],
    DamageImmunities: [],
    ConditionImmunities: [],
    Saves: [],
    Skills: [],
    Senses: [],
    Languages: [],
    Challenge: "",
    Traits: [],
    Actions: [],
    LegendaryActions: []
  };
}

describe("UpdateLegacySavedEncounter", () => {
  test("Loads a v0.1 encounter", () => {
    const v1Encounter = {
      Name: "V0.1 Encounter",
      ActiveCreatureIndex: 0,
      Creatures: [
        {
          Statblock: makev0_1StatBlock(),
          CurrentHP: 1,
          TemporaryHP: 0,
          Initiative: 10,
          Alias: "",
          Tags: ["string tag"]
        }
      ]
    };

    const updatedEncounter = UpdateLegacySavedEncounter(v1Encounter);
    expect(updatedEncounter.Id).toBe("V01_Encounter");
    expect(updatedEncounter.Name).toBe("V0.1 Encounter");
    expect(updatedEncounter.Path).toBe("");
    expect(updatedEncounter.Version).toBe("legacy");
    expect(updatedEncounter.Combatants).toHaveLength(1);

    const updatedCombatant = updatedEncounter.Combatants[0];

    expect(updatedCombatant.Id).toHaveLength(8);
    expect(updatedCombatant.CurrentHP).toBe(1);
    expect(updatedCombatant.RevealedAC).toBe(false);
    expect(updatedCombatant.Tags).toEqual([
      {
        Text: "string tag",
        DurationRemaining: 0,
        DurationTiming: null,
        DurationCombatantId: ""
      }
    ]);
  });
});

describe("UpdateLegacyEncounterState", () => {
  test("Loads a v0.1 encounter", () => {
    const v1Encounter = {
      Name: "V0.1 Encounter",
      ActiveCreatureIndex: 0,
      Creatures: [
        {
          Statblock: makev0_1StatBlock(),
          CurrentHP: 1,
          TemporaryHP: 0,
          Initiative: 10,
          Alias: "",
          Tags: []
        }
      ]
    };

    const updatedEncounter = UpdateLegacyEncounterState(v1Encounter);
    expect(updatedEncounter.Combatants).toHaveLength(1);
    expect(updatedEncounter.RoundCounter).toEqual(0);

    const updatedCombatant = updatedEncounter.Combatants[0];

    expect(updatedCombatant.Id).toHaveLength(8);
    expect(updatedEncounter.ActiveCombatantId).toEqual(updatedCombatant.Id);
    expect(updatedCombatant.CurrentHP).toBe(1);
    expect(updatedCombatant.RevealedAC).toBe(false);
  });
});
