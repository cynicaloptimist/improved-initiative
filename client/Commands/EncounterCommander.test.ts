import { InitializeCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterCommander } from "./EncounterCommander";

describe("EncounterCommander", () => {
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

  test("Cannot start an empty encounter.", () => {
    encounterCommander.StartEncounter();
    expect(encounter.State()).toBe("inactive");
    expect(encounter.Combatants().length).toBe(0);
    expect(!encounter.ActiveCombatant());
  });

  test("Click Next Turn with no combatants.", () => {
    encounter.NextTurn = jest.fn(encounter.NextTurn);
    expect(!encounter.ActiveCombatant());
    encounterCommander.NextTurn();
    expect(encounter.RoundCounter() == 1);
    expect(encounter.NextTurn).not.toBeCalled();
  });

  test("Calling Next Turn should start an inactive encounter.", () => {
    const startEncounter = (encounterCommander.StartEncounter = jest.fn());

    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    expect(!encounter.ActiveCombatant());
    encounterCommander.NextTurn();

    expect(startEncounter).toBeCalled();
  });

  test("CleanEncounter", async () => {
    const persistentCharacter = InitializeCharacter({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(persistentCharacter, {
      UpdatePersistentCharacter: async () => {}
    });

    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.CleanEncounter();
    expect(encounter.Combatants().length).toBe(1);
  });

  test("ClearEncounter", async () => {
    const persistentCharacter = InitializeCharacter({
      ...StatBlock.Default(),
      Player: "player"
    });
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    await encounter.AddCombatantFromPersistentCharacter(persistentCharacter, {
      UpdatePersistentCharacter: async () => {}
    });

    expect(encounter.Combatants().length).toBe(2);
    encounterCommander.ClearEncounter();
    expect(encounter.Combatants().length).toBe(0);
  });
});
