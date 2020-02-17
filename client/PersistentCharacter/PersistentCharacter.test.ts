import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { SavedEncounter } from "../../common/SavedEncounter";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { SaveEncounterPrompt } from "../Commands/Prompts/SaveEncounterPrompt";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { InitializeSettings } from "../Settings/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { buildEncounter } from "../test/buildEncounter";

describe("InitializeCharacter", () => {
  it("Should have the current HP of the provided statblock", () => {
    const statBlock = StatBlock.Default();
    statBlock.HP.Value = 10;
    const character = PersistentCharacter.Initialize(statBlock);
    expect(character.CurrentHP).toBe(10);
  });
});

describe("PersistentCharacterLibrary", () => {
  beforeEach(() => {
    localStorage.clear();
    window["$"] = require("jquery");
  });

  function savePersistentCharacterWithName(name: string) {
    const persistentCharacter = PersistentCharacter.Default();
    persistentCharacter.Name = name;
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.PersistentCharacters,
      persistentCharacter.Id,
      persistentCharacter
    );
    return persistentCharacter.Id;
  }

  function savePlayerCharacterWithName(name: string) {
    const playerCharacter = StatBlock.Default();
    playerCharacter.Name = name;
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.PlayerCharacters,
      playerCharacter.Id,
      playerCharacter
    );
    return playerCharacter.Id;
  }

  it("Should load stored PersistentCharacters", () => {
    savePersistentCharacterWithName("Persistent Character");

    const library = new PersistentCharacterLibrary(new AccountClient());
    const listings = library.GetListings();
    expect(listings).toHaveLength(1);
    expect(listings[0].Listing().Name).toEqual("Persistent Character");
  });

  it("Should create new PersistentCharacters for existing PlayerCharacter statblocks", () => {
    savePlayerCharacterWithName("Player Character");

    const library = new PersistentCharacterLibrary(new AccountClient());
    const listings = library.GetListings();
    expect(listings).toHaveLength(1);
    expect(listings[0].Listing().Name).toEqual("Player Character");
  });

  it("Should not create duplicate PersistentCharacters for already converted PlayerCharacters", () => {
    savePersistentCharacterWithName("Persistent Character");
    savePlayerCharacterWithName("Player Character");

    const library = new PersistentCharacterLibrary(new AccountClient());
    const listings = library.GetListings();
    expect(listings).toHaveLength(1);
    expect(listings[0].Listing().Name).toEqual("Persistent Character");
  });

  it("Should provide the latest version of a Persistent Character", async done => {
    jest.useFakeTimers();
    InitializeSettings();

    savePersistentCharacterWithName("Persistent Character");

    const library = new PersistentCharacterLibrary(new AccountClient());
    const listing = library.GetListings()[0];
    const persistentCharacter = await listing.GetWithTemplate(
      PersistentCharacter.Default()
    );

    await library.UpdatePersistentCharacter(persistentCharacter.Id, {
      CurrentHP: 0
    });

    const updatedPersistentCharacter: PersistentCharacter = await listing.GetWithTemplate(
      PersistentCharacter.Default()
    );
    expect(updatedPersistentCharacter.CurrentHP).toEqual(0);
    done();
  });
});

describe("PersistentCharacter", () => {
  it("Should not save PersistentCharacters with Encounters", () => {
    const encounter = buildEncounter();
    const library = new PersistentCharacterLibrary(new AccountClient());

    encounter.AddCombatantFromPersistentCharacter(
      PersistentCharacter.Default(),
      library
    );

    encounter.AddCombatantFromStatBlock(StatBlock.Default());

    const prompt = SaveEncounterPrompt(
      encounter.ObservableEncounterState(),
      "",
      savedEncounter => {
        expect(savedEncounter.Combatants.length).toEqual(1);
      },
      () => {},
      []
    );

    const formValues = prompt.initialValues;
    formValues.Name = "Test";
    prompt.onSubmit(formValues);

    expect.assertions(1);
  });

  it("Should not allow the same Persistent Character to be added twice", () => {
    const persistentCharacter = PersistentCharacter.Default();
    const encounter = buildEncounter();
    const library = new PersistentCharacterLibrary(new AccountClient());

    encounter.AddCombatantFromPersistentCharacter(persistentCharacter, library);
    expect(encounter.Combatants().length).toBe(1);

    encounter.AddCombatantFromPersistentCharacter(persistentCharacter, library);
    expect(encounter.Combatants().length).toBe(1);
  });

  it("Should allow the user to save notes", () => {});

  it("Should update the Character when a linked Combatant's hp changes", () => {
    const persistentCharacter = PersistentCharacter.Default();
    const encounter = buildEncounter();
    const library = new PersistentCharacterLibrary(new AccountClient());
    const update = jest.fn();
    library.UpdatePersistentCharacter = update;

    const combatant = encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      library
    );
    combatant.ApplyDamage(1);

    expect(update.mock.calls).toEqual([
      [persistentCharacter.Id, { CurrentHP: 0 }]
    ]);
  });

  it("Should update the combatant statblock when it is edited from the library", () => {});

  it("Should update the library statblock when it is edited from the combatant", () => {});

  it("Should render combatant notes with markdown", () => {});

  it("Should remember persistent characters for autosaved encounter state", () => {
    const encounter = buildEncounter();
    const library = new PersistentCharacterLibrary(new AccountClient());

    encounter.AddCombatantFromPersistentCharacter(
      PersistentCharacter.Default(),
      library
    );

    const encounterState: EncounterState<CombatantState> = encounter.ObservableEncounterState();
    expect(encounterState.Combatants.length).toEqual(1);
  });
});

describe("Metadata", () => {
  it("Should handle just a number", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "1"
    });
    const metadata = PersistentCharacter.GetMetadata(persistentCharacter);
    expect(metadata.Level).toEqual("1");
  });

  it("Should handle a class with level", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "Fighter 5"
    });
    const metadata = PersistentCharacter.GetMetadata(persistentCharacter);
    expect(metadata.Level).toEqual("5");
  });

  it("Should handle multiple classes with levels", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "Fighter 5, Rogue 5"
    });
    const metadata = PersistentCharacter.GetMetadata(persistentCharacter);
    expect(metadata.Level).toEqual("10");
  });
});

describe("Resolving differences between local storage and account sync", () => {
  it("Should use the local storage persistent character if newer", () => {});
  it("Should use the account sync persistent character if newer", () => {});
});
