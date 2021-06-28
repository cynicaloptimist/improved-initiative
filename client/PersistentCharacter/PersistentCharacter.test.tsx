import * as React from "react";
import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { SaveEncounterPrompt } from "../Prompts/SaveEncounterPrompt";
import { InitializeSettings } from "../Settings/Settings";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { buildEncounter } from "../test/buildEncounter";
import { useLibraries } from "../Library/Libraries";
import { LibrariesCommander } from "../Commands/LibrariesCommander";
import { useEffect } from "react";
import { act, render } from "@testing-library/react";
import { Library } from "../Library/useLibrary";
import { Listing } from "../Library/Listing";

import axios from "axios";
jest.mock("axios");

function LibrariesCommanderHarness(props: {
  librariesCommander: LibrariesCommander;
  loadingFinished: () => void;
}) {
  const libraries = useLibraries(new AccountClient(), props.loadingFinished);
  useEffect(() => props.librariesCommander.SetLibraries(libraries), []);
  return <div />;
}

function PersistentCharacterLibraryHarness(props: {
  setLibrary: (library: Library<PersistentCharacter>) => void;
  loadingFinished: () => void;
}) {
  const libraries = useLibraries(new AccountClient(), props.loadingFinished);
  useEffect(() => {
    props.setLibrary(libraries.PersistentCharacters);
  }, [libraries]);
  return <div />;
}

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
    (axios.get as jest.Mock).mockResolvedValue(null);
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

  it("Should load stored PersistentCharacters", async () => {
    let listings: Listing<PersistentCharacter>[];
    let library: Library<PersistentCharacter>;
    await act(async () => {
      savePersistentCharacterWithName("Persistent Character");

      await new Promise<void>(done => {
        render(
          <PersistentCharacterLibraryHarness
            setLibrary={r => (library = r)}
            loadingFinished={done}
          />
        );
      });
    });

    listings = library.GetAllListings();

    expect(listings).toHaveLength(1);
    expect(listings[0].Meta().Name).toEqual("Persistent Character");
  });

  it("Should provide the latest version of a Persistent Character", async () => {
    let listing: Listing<PersistentCharacter>;

    await act(async () => {
      InitializeSettings();
      savePersistentCharacterWithName("Persistent Character");
      let library: Library<PersistentCharacter>;
      await new Promise<void>(done => {
        render(
          <PersistentCharacterLibraryHarness
            setLibrary={r => (library = r)}
            loadingFinished={done}
          />
        );
      });
      listing = library.GetAllListings()[0];
      const persistentCharacter = await listing.GetWithTemplate(
        PersistentCharacter.Default()
      );

      const librariesCommander = new LibrariesCommander(null, null);

      await new Promise<void>(done => {
        render(
          <LibrariesCommanderHarness
            librariesCommander={librariesCommander}
            loadingFinished={done}
          />
        );
      });

      listing = await librariesCommander.UpdatePersistentCharacter(
        persistentCharacter.Id,
        {
          CurrentHP: 0
        }
      );
    });

    const updatedPersistentCharacter = await listing.GetWithTemplate(
      PersistentCharacter.Default()
    );
    expect(updatedPersistentCharacter.CurrentHP).toEqual(0);
  });
});

describe("PersistentCharacter", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue(null);
    InitializeSettings();
  });

  it("Should not save PersistentCharacters with Encounters", async () => {
    const encounter = buildEncounter();
    let library: Library<PersistentCharacter>;
    await act(async () => {
      await new Promise<void>(done => {
        render(
          <PersistentCharacterLibraryHarness
            setLibrary={r => (library = r)}
            loadingFinished={done}
          />
        );
      });

      encounter.AddCombatantFromPersistentCharacter(
        PersistentCharacter.Default(),
        library.GetAllListings,
        false
      );

      encounter.AddCombatantFromStatBlock(StatBlock.Default());

      const prompt = SaveEncounterPrompt(
        encounter.ObservableEncounterState(),
        "",
        async savedEncounter => {
          expect(savedEncounter.Combatants.length).toEqual(1);
          return null;
        },
        () => {},
        []
      );

      const formValues = prompt.initialValues;
      formValues.Name = "Test";
      prompt.onSubmit(formValues);
    });

    expect.assertions(1);
  });

  it.only("Should not allow the same Persistent Character to be added twice", async () => {
    const persistentCharacter = PersistentCharacter.Default();
    const encounter = buildEncounter();
    let library: Library<PersistentCharacter>;

    await act(async () => {
      await new Promise<void>(done => {
        render(
          <PersistentCharacterLibraryHarness
            setLibrary={r => (library = r)}
            loadingFinished={done}
          />
        );
      });
      encounter.AddCombatantFromPersistentCharacter(
        persistentCharacter,
        library.GetAllListings
      );

      encounter.AddCombatantFromPersistentCharacter(
        persistentCharacter,
        library.GetAllListings
      );
    });

    expect(encounter.Combatants().length).toBe(1);
  });

  it("Should allow the user to save notes", () => {});

  it("Should update the Character when a linked Combatant's hp changes", () => {
    const persistentCharacter = PersistentCharacter.Default();
    const encounter = buildEncounter();

    const update = jest.fn();

    const combatant = encounter.AddCombatantFromPersistentCharacter(
      persistentCharacter,
      update
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
    encounter.AddCombatantFromPersistentCharacter(
      PersistentCharacter.Default(),
      () => {}
    );

    const encounterState: EncounterState<CombatantState> = encounter.ObservableEncounterState();
    expect(encounterState.Combatants.length).toEqual(1);
  });
});

describe("FilterDimensions.Level", () => {
  it("Should handle just a number", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "1"
    });
    const filterDimensions = PersistentCharacter.GetFilterDimensions(
      persistentCharacter
    );
    expect(filterDimensions.Level).toEqual("1");
  });

  it("Should handle a class with level", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "Fighter 5"
    });
    const filterDimensions = PersistentCharacter.GetFilterDimensions(
      persistentCharacter
    );
    expect(filterDimensions.Level).toEqual("5");
  });

  it("Should handle multiple classes with levels", () => {
    const persistentCharacter = PersistentCharacter.Initialize({
      ...StatBlock.Default(),
      Challenge: "Fighter 5, Rogue 5"
    });
    const filterDimensions = PersistentCharacter.GetFilterDimensions(
      persistentCharacter
    );
    expect(filterDimensions.Level).toEqual("10");
  });
});

describe("Resolving differences between local storage and account sync", () => {
  it("Should use the local storage persistent character if newer", () => {});
  it("Should use the account sync persistent character if newer", () => {});
});
