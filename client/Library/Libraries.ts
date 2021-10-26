import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { Account } from "../Account/Account";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { SavedEncounter } from "../../common/SavedEncounter";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { Library, useLibrary } from "./useLibrary";
import React = require("react");
import { Listable, ListingMeta } from "../../common/Listable";
import axios from "axios";

export type UpdatePersistentCharacter = (
  persistentCharacterId: string,
  updates: Partial<PersistentCharacter>
) => void;

export const LibraryFriendlyNames = {
  StatBlocks: "Creatures",
  PersistentCharacters: "Characters",
  Encounters: "Encounters",
  Spells: "Spells"
};

export const LibraryStoreNames: Record<LibraryType, string> = {
  StatBlocks: Store.StatBlocks,
  PersistentCharacters: Store.PersistentCharacters,
  Encounters: Store.SavedEncounters,
  Spells: Store.Spells
};

export type LibraryType = keyof typeof LibraryFriendlyNames;

export function GetDefaultForLibrary(libraryType: LibraryType): Listable {
  if (libraryType === "StatBlocks") {
    return StatBlock.Default();
  }
  if (libraryType === "PersistentCharacters") {
    return PersistentCharacter.Default();
  }
  if (libraryType === "Encounters") {
    return SavedEncounter.Default();
  }
  if (libraryType === "Spells") {
    return Spell.Default();
  }

  return null;
}

export interface Libraries {
  PersistentCharacters: Library<PersistentCharacter>;
  StatBlocks: Library<StatBlock>;
  Encounters: Library<SavedEncounter>;
  Spells: Library<Spell>;
}

function dummyLibrary<T extends Listable>(): Library<T> {
  return {
    AddListings: () => {},
    DeleteListing: () => Promise.resolve(),
    GetAllListings: () => [],
    GetOrCreateListingById: () => Promise.resolve(null),
    SaveEditedListing: () => Promise.resolve(null),
    SaveNewListing: () => Promise.resolve(null)
  };
}

export const LibrariesContext = React.createContext<Libraries>({
  StatBlocks: dummyLibrary(),
  Encounters: dummyLibrary(),
  PersistentCharacters: dummyLibrary(),
  Spells: dummyLibrary()
});

export function useLibraries(
  accountClient: AccountClient,
  loadingFinished?: (storeName: string, count: number) => void
): Libraries {
  const PersistentCharacters = useLibrary(
    Store.PersistentCharacters,
    "persistentcharacters",
    {
      createEmptyListing: PersistentCharacter.Default,
      accountSave: accountClient.SavePersistentCharacter,
      accountDelete: accountClient.DeletePersistentCharacter,
      getFilterDimensions: PersistentCharacter.GetFilterDimensions,
      getSearchHint: PersistentCharacter.GetSearchHint,
      loadingFinished
    }
  );
  const StatBlocks = useLibrary(Store.StatBlocks, "statblocks", {
    createEmptyListing: StatBlock.Default,
    accountSave: accountClient.SaveStatBlock,
    accountDelete: accountClient.DeleteStatBlock,
    getFilterDimensions: StatBlock.FilterDimensions,
    getSearchHint: StatBlock.GetSearchHint
  });
  const Encounters = useLibrary(Store.SavedEncounters, "encounters", {
    createEmptyListing: SavedEncounter.Default,
    accountSave: accountClient.SaveEncounter,
    accountDelete: accountClient.DeleteEncounter,
    getFilterDimensions: () => ({}),
    getSearchHint: SavedEncounter.GetSearchHint
  });

  const Spells = useLibrary(Store.Spells, "spells", {
    createEmptyListing: Spell.Default,
    accountSave: accountClient.SaveSpell,
    accountDelete: accountClient.DeleteSpell,
    getFilterDimensions: Spell.GetFilterDimensions,
    getSearchHint: Spell.GetSearchHint
  });

  const libraries: Libraries = {
    StatBlocks,
    PersistentCharacters,
    Encounters,
    Spells
  };

  React.useEffect(() => {
    preloadStatBlocks(StatBlocks);
    preloadSpells(Spells);
    getAccountOrSampleCharacters(
      accountClient,
      PersistentCharacters,
      libraries,
      () => loadingFinished("UserAccount", 1)
    );
  }, []);

  return libraries;
}

async function preloadStatBlocks(StatBlocks: Library<StatBlock>) {
  const serverResponse = await axios.get<ListingMeta[]>("../statblocks/");
  if (serverResponse) {
    const listings = serverResponse.data;
    StatBlocks.AddListings(listings, "server");
  }
}

async function preloadSpells(Spells: Library<Spell>) {
  const serverResponse = await axios.get<ListingMeta[]>("../spells/");
  if (serverResponse) {
    const listings = serverResponse.data;
    Spells.AddListings(listings, "server");
  }
}

function getAccountOrSampleCharacters(
  accountClient: AccountClient,
  PersistentCharacters: Library<PersistentCharacter>,
  libraries: Libraries,
  callback: () => void
) {
  accountClient.GetAccount(async account => {
    if (!account) {
      const persistentCharacterCount = await Store.Count(
        Store.PersistentCharacters
      );
      if (persistentCharacterCount == 0) {
        getAndAddSamplePersistentCharacters(PersistentCharacters);
      }
      callback();
      return;
    }

    handleAccountSync(account, accountClient, libraries);
    callback();
  });
}

const getAndAddSamplePersistentCharacters = (
  persistentCharacterLibrary: Library<PersistentCharacter>
) => {
  axios.get<StatBlock[]>("/sample_players.json").then(response => {
    if (!response) {
      return;
    }
    const statblocks = response.data;
    statblocks.forEach(statBlock => {
      statBlock.Path = "Sample Player Characters";
      const persistentCharacter = PersistentCharacter.Initialize({
        ...StatBlock.Default(),
        ...statBlock
      });
      persistentCharacterLibrary.SaveNewListing(persistentCharacter);
    });
  });
};

const handleAccountSync = (
  account: Account,
  accountClient: AccountClient,
  libraries: Libraries
) => {
  if (account.statblocks) {
    libraries.StatBlocks.AddListings(account.statblocks, "account");
  }

  if (account.persistentcharacters) {
    libraries.PersistentCharacters.AddListings(
      account.persistentcharacters,
      "account"
    );
  }

  if (account.spells) {
    libraries.Spells.AddListings(account.spells, "account");
  }

  if (account.encounters) {
    libraries.Encounters.AddListings(account.encounters, "account");
  }

  accountClient.SaveAllUnsyncedItems(libraries, () => {});
};
