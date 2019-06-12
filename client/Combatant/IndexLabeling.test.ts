import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";

function buildEncounterState() {
  const statBlock = { ...StatBlock.Default(), Name: "Goblin" };
  const oldEncounter = buildEncounter();
  oldEncounter.AddCombatantFromStatBlock(statBlock);
  oldEncounter.AddCombatantFromStatBlock(statBlock);
  const savedEncounter = oldEncounter.GetEncounterState();
  return savedEncounter;
}

describe("Index labeling", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });

  test("A lone combatant is not index labelled.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };
    const combatant1 = encounter.AddCombatantFromStatBlock(statBlock);
    expect(combatant1.DisplayName()).toEqual("Goblin");
  });

  test("When multiple combatants are added with the same name, they should display index labels.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = encounter.AddCombatantFromStatBlock(statBlock);
    const combatant2 = encounter.AddCombatantFromStatBlock(statBlock);
    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When a combatant statblock name changes, it receives an index label if necessary", () => {
    const statBlock1 = { ...StatBlock.Default(), Name: "Goblin" };
    const statBlock2 = { ...StatBlock.Default(), Name: "Not Goblin" };

    const combatant1 = encounter.AddCombatantFromStatBlock(statBlock1);
    const combatant2 = encounter.AddCombatantFromStatBlock(statBlock2);
    combatant2.StatBlock(statBlock1);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When all combatants the same name are removed, index labelling should reset.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = encounter.AddCombatantFromStatBlock(statBlock);
    const combatant2 = encounter.AddCombatantFromStatBlock(statBlock);
    encounter.RemoveCombatant(combatant1);
    encounter.RemoveCombatant(combatant2);

    const newCombatant1 = encounter.AddCombatantFromStatBlock(statBlock);

    expect(newCombatant1.DisplayName()).toEqual("Goblin");

    const newCombatant2 = encounter.AddCombatantFromStatBlock(statBlock);

    expect(newCombatant1.DisplayName()).toEqual("Goblin 1");
    expect(newCombatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When a combatant is added from a saved encounter, it retains its saved index label", () => {
    const savedEncounter = buildEncounterState();
    const combatantStates = savedEncounter.Combatants;

    const combatant1 = encounter.AddCombatantFromState(combatantStates[0]);
    expect(combatant1.DisplayName()).toEqual("Goblin");

    const combatant2 = encounter.AddCombatantFromState(combatantStates[1]);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When a saved encounter is added twice, it relabels existing creatures", () => {
    const savedEncounter = buildEncounterState();
    const combatantStates = savedEncounter.Combatants;

    const combatant1 = encounter.AddCombatantFromState(combatantStates[0]);
    const combatant2 = encounter.AddCombatantFromState(combatantStates[1]);

    const combatant3 = encounter.AddCombatantFromState(combatantStates[0]);
    const combatant4 = encounter.AddCombatantFromState(combatantStates[1]);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
    expect(combatant3.DisplayName()).toEqual("Goblin 3");
    expect(combatant4.DisplayName()).toEqual("Goblin 4");
  });

  test("When a labelled combatant is removed, its index label is not reused.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = encounter.AddCombatantFromStatBlock(statBlock);
    const combatant2 = encounter.AddCombatantFromStatBlock(statBlock);
    encounter.RemoveCombatant(combatant2);

    const combatant3 = encounter.AddCombatantFromStatBlock(statBlock);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
    expect(combatant3.DisplayName()).toEqual("Goblin 3");
  });

  test("When a saved encounter is repeatedly added in waves, index labeling is consistent", () => {
    const savedEncounter = buildEncounterState();
    const combatantStates = savedEncounter.Combatants;

    const combatant1 = encounter.AddCombatantFromState(combatantStates[0]);
    const combatant2 = encounter.AddCombatantFromState(combatantStates[1]);

    encounter.RemoveCombatant(combatant2);

    const combatant3 = encounter.AddCombatantFromState(combatantStates[0]);
    const combatant4 = encounter.AddCombatantFromState(combatantStates[1]);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
    expect(combatant3.DisplayName()).toEqual("Goblin 3");
    expect(combatant4.DisplayName()).toEqual("Goblin 4");
  });
});
