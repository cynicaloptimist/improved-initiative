import { UpdateLegacySavedEncounter } from "./UpdateLegacySavedEncounter";

describe("Legacy Encounter", () => {
  test("Loads a v0.1 encounter", () => {
    const legacyStatBlock = {
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

    const v1Encounter = {
      Name: "V0.1 Encounter",
      Creatures: [
        {
          Statblock: legacyStatBlock,
          CurrentHP: 1,
          TemporaryHP: 0,
          Initiative: 10,
          Alias: "",
          Tags: []
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
    expect(updatedCombatant.CurrentHP).toBe(1);
  });
});
