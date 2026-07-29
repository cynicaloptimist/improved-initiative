import { PersistentCharacter } from "../../common/PersistentCharacter";
import { SavedEncounter } from "../../common/SavedEncounter";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { TrackerViewModel } from "../TrackerViewModel";
import { addCombatantFromStatBlock } from "../test/addCombatant";
import { buildEncounter } from "../test/buildEncounter";
import { EncounterCommander } from "./EncounterCommander";
import { renderHook } from "@testing-library/react-hooks";
import { useLibraries } from "../Library/Libraries";
import { CurrentSettings } from "../Settings/Settings";
import { MockAccountClient } from "../MockAccountClient";

describe("EncounterCommander", () => {
  let encounter: Encounter;
  let encounterCommander: EncounterCommander;
  let trackerViewModel: TrackerViewModel;
  beforeEach(() => {
    window.confirm = () => true;
    InitializeTestSettings({
      PreloadedContent: {
        BasicRules: false,
        Open5eContent: false
      }
    });

    const mockIo: any = {
      on: jest.fn(),
      emit: jest.fn()
    };

    const librariesHook = renderHook(() =>
      useLibraries(CurrentSettings(), MockAccountClient(), () => {})
    );
    const libraries = librariesHook.result.current;
    trackerViewModel = new TrackerViewModel(mockIo);
    trackerViewModel.SetLibraries(libraries);
    encounter = trackerViewModel.Encounter;
    encounterCommander = trackerViewModel.EncounterCommander;
  });

  afterEach(() => {
    encounter.ClearEncounter();
  });

  function buildSavedEncounter(Name: string, Path: string): SavedEncounter {
    return {
      ...SavedEncounter.Default(),
      Name,
      Path,
      Combatants: []
    };
  }

  function getSavePrompt() {
    trackerViewModel.LibrariesCommander.SaveEncounter();
    const prompts = trackerViewModel.PromptQueue.GetPrompts();
    return prompts[prompts.length - 1][0];
  }

  function submitSaveEncounter(Name: string, Path: string) {
    trackerViewModel.Libraries.Encounters.SaveNewListing = jest.fn(
      async () => null
    );
    const prompt = getSavePrompt();
    prompt.onSubmit({ ...prompt.initialValues, Name, Path });
  }

  test("Cannot start an empty encounter.", () => {
    encounterCommander.StartEncounter();
    expect(encounter.EncounterFlow.State()).toBe("inactive");
    expect(encounter.Combatants().length).toBe(0);
    expect(encounter.EncounterFlow.ActiveCombatant()).toBeFalsy();
  });

  test("Click Next Turn with no combatants.", () => {
    encounter.EncounterFlow.NextTurn = jest.fn(
      encounter.EncounterFlow.NextTurn
    );
    expect(encounter.EncounterFlow.ActiveCombatant()).toBeFalsy();
    encounterCommander.NextTurn();
    expect(encounter.EncounterFlow.CombatTimer.ElapsedRounds()).toBe(0);
    expect(encounter.EncounterFlow.NextTurn).not.toHaveBeenCalled();
  });

  test("Calling Next Turn should start an inactive encounter.", () => {
    const startEncounter = (encounterCommander.StartEncounter = jest.fn());

    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    expect(encounter.EncounterFlow.ActiveCombatant()).toBeFalsy();
    encounterCommander.NextTurn();

    expect(startEncounter).toHaveBeenCalled();
  });

  test("CleanEncounter", async () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      () => {},
      false
    );

    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.CleanEncounter();
    expect(encounter.Combatants().length).toBe(2);
    expect(encounter.CombatantsPendingRemove().length).toBe(1);
    expect(encounter.ObservableEncounterState().Combatants.length).toBe(1);
  });

  test("Save Encounter starts with empty defaults", () => {
    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "",
      Path: ""
    });
  });

  test("Save Encounter keeps an empty folder as a default", () => {
    submitSaveEncounter("New Encounter", "");

    expect(encounter.SaveEncounterDefaults()).toEqual({
      Name: "New Encounter",
      Path: ""
    });
    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "New Encounter",
      Path: ""
    });
  });

  test("opening a saved encounter uses its name and folder as save defaults until cleaning", async () => {
    const savedEncounter = buildSavedEncounter("Goblin Ambush", "Chapter 1");

    await encounterCommander.LoadSavedEncounter(savedEncounter);

    expect(encounter.SaveEncounterDefaults()).toEqual({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });

    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });

    encounterCommander.CleanEncounter();
    expect(encounter.SaveEncounterDefaults()).toBeNull();

    expect(getSavePrompt().initialValues).toMatchObject({ Name: "", Path: "" });

    submitSaveEncounter("New Encounter", "New Folder");

    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "New Encounter",
      Path: "New Folder"
    });
  });

  test("opening another saved encounter replaces the save defaults", async () => {
    await encounterCommander.LoadSavedEncounter(
      buildSavedEncounter("Goblin Ambush", "Chapter 1")
    );
    await encounterCommander.LoadSavedEncounter(
      buildSavedEncounter("Dragon Attack", "Chapter 2")
    );

    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "Dragon Attack",
      Path: "Chapter 2"
    });
  });

  test("saving an opened encounter under a new name replaces the save defaults", async () => {
    await encounterCommander.LoadSavedEncounter(
      buildSavedEncounter("Goblin Ambush", "Chapter 1")
    );

    submitSaveEncounter("Dragon Attack", "Chapter 2");

    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "Dragon Attack",
      Path: "Chapter 2"
    });
  });

  test("cancelling Save Encounter preserves its current defaults", async () => {
    await encounterCommander.LoadSavedEncounter(
      buildSavedEncounter("Goblin Ambush", "Chapter 1")
    );

    getSavePrompt();
    const prompts = trackerViewModel.PromptQueue.GetPrompts();
    trackerViewModel.PromptQueue.Remove(prompts[prompts.length - 1][1]);

    expect(getSavePrompt().initialValues).toMatchObject({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
  });

  test("save defaults update before persistence completes", () => {
    trackerViewModel.Libraries.Encounters.SaveNewListing = jest.fn(
      () => new Promise(() => {})
    );
    const prompt = getSavePrompt();

    prompt.onSubmit({
      ...prompt.initialValues,
      Name: "Optimistic Save",
      Path: "Chapter 1"
    });

    expect(encounter.SaveEncounterDefaults()).toEqual({
      Name: "Optimistic Save",
      Path: "Chapter 1"
    });
  });

  test("ClearEncounter", async () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      () => {},
      false
    );

    encounter.SaveEncounterDefaults({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.ClearEncounter();
    expect(encounter.Combatants().length).toBe(0);
    expect(encounter.SaveEncounterDefaults()).toBeNull();
  });

  test("Restore Player Character HP", async () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Player: "player"
    });

    const npc = addCombatantFromStatBlock(encounter);
    const pc = await encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      () => {},
      false
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
  });

  function buildSavedEncounterWithPersistentCharacter() {
    const npcStatBlock = { ...StatBlock.Default(), Name: "Goblin" };
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Name: "Encounter Gregorr"
    });
    const oldEncounter = buildEncounter();
    oldEncounter.AddCombatantFromStatBlock(npcStatBlock);
    oldEncounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      () => {},
      false
    );
    const savedEncounter = oldEncounter.ObservableEncounterState();
    return savedEncounter;
  }

  test("LoadEncounter loads non-persistent combatants", async () => {
    const savedEncounter = buildSavedEncounterWithPersistentCharacter();
    await encounterCommander.LoadSavedEncounter(savedEncounter);
    expect(encounter.Combatants()[0].DisplayName()).toEqual("Goblin");
  });

  test("LoadEncounter loads the current version of persistent combatants", async () => {
    const savedEncounter = buildSavedEncounterWithPersistentCharacter();

    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Name: "Library Gregorr"
    });
    persistentCharacter.Id = savedEncounter.Combatants[1].PersistentCharacterId;

    trackerViewModel.Libraries.PersistentCharacters.GetOrCreateListingById =
      jest.fn(async () => ({
        GetWithTemplate: async () => persistentCharacter
      })) as any;

    await encounterCommander.LoadSavedEncounter(savedEncounter);

    expect(encounter.Combatants()[1].DisplayName()).toEqual("Library Gregorr");
  });

  describe("Index Labelling and Saved Encounters", () => {
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

    test("When a combatant is added from a saved encounter, it retains its saved index label", async () => {
      const savedEncounter = buildEncounterState();

      await encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => [c.DisplayName(), c.Initiative()]);

      expect(combatantDisplayNames).toContainEqual(["Goblin 1", 8]);
      expect(combatantDisplayNames).toContainEqual(["Goblin 2", 10]);
    });

    test("When a saved encounter is added twice, it relabels existing creatures", async () => {
      const savedEncounter = buildEncounterState();
      await encounterCommander.LoadSavedEncounter(savedEncounter);
      await encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => c.DisplayName());

      expect(combatantDisplayNames).toEqual(
        expect.arrayContaining([
          "Goblin 1",
          "Goblin 2",
          "Goblin 3",
          "Goblin 4"
        ])
      );
      expect(combatantDisplayNames).toHaveLength(4);
    });

    test("When a saved encounter is repeatedly added in waves, index labeling is consistent", async () => {
      const savedEncounter = buildEncounterState();
      await encounterCommander.LoadSavedEncounter(savedEncounter);

      encounter.RemoveCombatant(
        encounter.Combatants().find(c => c.DisplayName() == "Goblin 2")
      );
      encounter.FlushCombatants();

      await encounterCommander.LoadSavedEncounter(savedEncounter);

      const combatantDisplayNames = encounter
        .Combatants()
        .map(c => c.DisplayName());

      expect(combatantDisplayNames).toEqual(
        expect.arrayContaining(["Goblin 1", "Goblin 3", "Goblin 4"])
      );
      expect(combatantDisplayNames).toHaveLength(3);
    });
  });
});
