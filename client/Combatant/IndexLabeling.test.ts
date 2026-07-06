import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { addCombatantFromStatBlock } from "../test/addCombatant";
import { buildEncounter } from "../test/buildEncounter";

describe("Index labeling", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeTestSettings();
    encounter = buildEncounter();
  });

  test("A lone combatant is not index labelled.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };
    const combatant1 = addCombatantFromStatBlock(encounter, statBlock);
    expect(combatant1.DisplayName()).toEqual("Goblin");
  });

  test("When multiple combatants are added with the same name, they should display index labels.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = addCombatantFromStatBlock(encounter, statBlock);
    const combatant2 = addCombatantFromStatBlock(encounter, statBlock);
    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When a combatant statblock name changes, it receives an index label if necessary", () => {
    const statBlock1 = { ...StatBlock.Default(), Name: "Goblin" };
    const statBlock2 = { ...StatBlock.Default(), Name: "Not Goblin" };

    const combatant1 = addCombatantFromStatBlock(encounter, statBlock1);
    const combatant2 = addCombatantFromStatBlock(encounter, statBlock2);
    combatant2.StatBlock(statBlock1);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When all combatants the same name are removed, index labelling should reset.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = addCombatantFromStatBlock(encounter, statBlock);
    const combatant2 = addCombatantFromStatBlock(encounter, statBlock);
    encounter.RemoveCombatant(combatant1);
    encounter.RemoveCombatant(combatant2);
    encounter.FlushCombatants();

    const newCombatant1 = addCombatantFromStatBlock(encounter, statBlock);

    expect(newCombatant1.DisplayName()).toEqual("Goblin");

    const newCombatant2 = addCombatantFromStatBlock(encounter, statBlock);

    expect(newCombatant1.DisplayName()).toEqual("Goblin 1");
    expect(newCombatant2.DisplayName()).toEqual("Goblin 2");
  });

  test("When a labelled combatant is removed, its index label is not reused.", () => {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };

    const combatant1 = addCombatantFromStatBlock(encounter, statBlock);
    const combatant2 = addCombatantFromStatBlock(encounter, statBlock);
    encounter.RemoveCombatant(combatant2);

    const combatant3 = addCombatantFromStatBlock(encounter, statBlock);

    expect(combatant1.DisplayName()).toEqual("Goblin 1");
    expect(combatant2.DisplayName()).toEqual("Goblin 2");
    expect(combatant3.DisplayName()).toEqual("Goblin 3");
  });

  function buildEncounterState() {
    const statBlock = { ...StatBlock.Default(), Name: "Goblin" };
    const oldEncounter = buildEncounter();
    for (const initiative of [8, 10]) {
      const combatant = addCombatantFromStatBlock(oldEncounter, statBlock);
      combatant.Initiative(initiative);
    }
    oldEncounter.EncounterFlow.StartEncounter();
    const savedEncounter = oldEncounter.ObservableEncounterState();
    return savedEncounter;
  }

  test("When a saved encounter state is loaded, it keeps the correct index labels", () => {
    const encounterState = buildEncounterState();
    const newEncounter = buildEncounter();
    newEncounter.LoadEncounterState(encounterState, () => {}, null);

    const combatantDisplayNames = newEncounter
      .Combatants()
      .map(c => c.DisplayName());
    expect(combatantDisplayNames).toContain("Goblin 2");
    expect(combatantDisplayNames).toContain("Goblin 1");
  });
});
