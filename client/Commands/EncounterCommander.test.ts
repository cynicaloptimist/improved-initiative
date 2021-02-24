import { PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { buildEncounter } from "../test/buildEncounter";
import { EncounterCommander } from "./EncounterCommander";

describe.skip("EncounterCommander", () => {
  let encounter: Encounter;
  let encounterCommander: EncounterCommander;
  let trackerViewModel: TrackerViewModel;
  beforeEach(() => {
    window["$"] = require("jquery");
    window.confirm = () => true;
    InitializeSettings();

    const mockIo: any = {
      on: jest.fn(),
      emit: jest.fn()
    };

    trackerViewModel = new TrackerViewModel(mockIo);
    encounter = trackerViewModel.Encounter;
    encounterCommander = trackerViewModel.EncounterCommander;
  });

  afterEach(() => {
    encounter.ClearEncounter();
  });

  test("Cannot start an empty encounter.", () => {
    encounterCommander.StartEncounter();
    expect(encounter.EncounterFlow.State()).toBe("inactive");
    expect(encounter.Combatants().length).toBe(0);
    expect(!encounter.EncounterFlow.ActiveCombatant());
  });

  test("Click Next Turn with no combatants.", () => {
    encounter.EncounterFlow.NextTurn = jest.fn(
      encounter.EncounterFlow.NextTurn
    );
    expect(!encounter.EncounterFlow.ActiveCombatant());
    encounterCommander.NextTurn();
    expect(encounter.EncounterFlow.CombatTimer.ElapsedRounds() == 1);
    expect(encounter.EncounterFlow.NextTurn).not.toBeCalled();
  });

  test("Calling Next Turn should start an inactive encounter.", () => {
    const startEncounter = (encounterCommander.StartEncounter = jest.fn());

    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    expect(!encounter.EncounterFlow.ActiveCombatant());
    encounterCommander.NextTurn();

    expect(startEncounter).toBeCalled();
  });

  test("CleanEncounter", async done => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(persistentCharacter, {
      UpdatePersistentCharacter: async () => {
        return;
      }
    });

    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.CleanEncounter();
    expect(encounter.Combatants().length).toBe(1);
    return done();
  });

  test("ClearEncounter", async done => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(persistentCharacter, {
      UpdatePersistentCharacter: async () => {
        return;
      }
    });

    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.ClearEncounter();
    expect(encounter.Combatants().length).toBe(0);
    return done();
  });

  test("Restore Player Character HP", async done => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });

    const npc = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const pc = await encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      {
        UpdatePersistentCharacter: async () => {
          return;
        }
      }
    );

    expect(npc.CurrentHP()).toBe(1);
    expect(pc.CurrentHP()).toBe(1);

    npc.ApplyDamage(1);
    pc.ApplyDamage(1);

    expect(npc.CurrentHP()).toBe(0);
    expect(pc.CurrentHP()).toBe(0);

    encounterCommander.RestoreAllPlayerCharacterHP();

    expect(npc.CurrentHP()).toBe(0);
    expect(pc.CurrentHP()).toBe(1);

    return done();
  });

  function buildSavedEncounterWithPersistentCharacter() {
    const npcStatBlock = { ...StatBlock.Default(), Name: "Goblin" };
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Name: "Encounter Gregorr"
    });
    const oldEncounter = buildEncounter();
    oldEncounter.AddCombatantFromStatBlock(npcStatBlock);
    oldEncounter.AddCombatantFromPersistentCharacter(persistentCharacter, {
      UpdatePersistentCharacter: async () => {}
    });
    const savedEncounter = oldEncounter.ObservableEncounterState();
    return savedEncounter;
  }

  test("LoadEncounter loads non-persistent combatants", () => {
    const savedEncounter = buildSavedEncounterWithPersistentCharacter();
    encounterCommander.LoadSavedEncounter(savedEncounter);
    expect(encounter.Combatants()[0].DisplayName()).toEqual("Goblin");
  });

  test("LoadEncounter loads the current version of persistent combatants", async done => {
    const savedEncounter = buildSavedEncounterWithPersistentCharacter();

    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Name: "Library Gregorr"
    });
    persistentCharacter.Id = savedEncounter.Combatants[1].PersistentCharacterId;

    trackerViewModel.Libraries.PersistentCharacters.AddNewPersistentCharacter(
      persistentCharacter
    );

    await encounterCommander.LoadSavedEncounter(savedEncounter);

    expect(encounter.Combatants()[1].DisplayName()).toEqual("Library Gregorr");
    done();
  });

  describe("Index Labelling and Saved Encounters", () => {
    function buildEncounterState() {
      const statBlock = { ...StatBlock.Default(), Name: "Goblin" };
      const oldEncounter = buildEncounter();
      for (const initiative of [8, 10]) {
        const combatant = oldEncounter.AddCombatantFromStatBlock(statBlock);
        combatant.Initiative(initiative);
      }
      oldEncounter.EncounterFlow.StartEncounter();
      const savedEncounter = oldEncounter.ObservableEncounterState();
      return savedEncounter;
    }

    test("When a combatant is added from a saved encounter, it retains its saved index label", () => {
      const savedEncounter = buildEncounterState();

      encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => [c.DisplayName(), c.Initiative()]);

      expect(combatantDisplayNames).toEqual([
        ["Goblin 1", 8],
        ["Goblin 2", 10]
      ]);
    });

    test("When a saved encounter is added twice, it relabels existing creatures", () => {
      const savedEncounter = buildEncounterState();
      encounterCommander.LoadSavedEncounter(savedEncounter);
      encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => c.DisplayName());

      expect(combatantDisplayNames).toEqual([
        "Goblin 1",
        "Goblin 2",
        "Goblin 3",
        "Goblin 4"
      ]);
    });

    test("When a saved encounter is repeatedly added in waves, index labeling is consistent", () => {
      const savedEncounter = buildEncounterState();
      encounterCommander.LoadSavedEncounter(savedEncounter);

      encounter.RemoveCombatant(encounter.Combatants()[1]);

      encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => c.DisplayName());

      expect(combatantDisplayNames).toEqual([
        "Goblin 1",
        "Goblin 3",
        "Goblin 4"
      ]);
    });
  });
});
