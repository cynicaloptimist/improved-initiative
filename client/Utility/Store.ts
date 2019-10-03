import * as localforage from "localforage";

import moment = require("moment");
import { Listable } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { DnDAppFilesImporter } from "../Importers/DnDAppFilesImporter";

export namespace Store {
  export const PersistentCharacters = "PersistentCharacters";
  export const PlayerCharacters = "PlayerCharacters";
  export const StatBlocks = "Creatures";
  export const Spells = "Spells";
  export const SavedEncounters = "SavedEncounters";
  export const AutoSavedEncounters = "AutoSavedEncounters";
  export const User = "User";

  export const DefaultSavedEncounterId = "default";

  export const SupportedLists = [StatBlocks];

  export async function Save<T>(listName: string, key: string, value: T) {
    if (typeof key !== "string") {
      throw `Can't save to non-string key ${key}`;
    }
    await save(listName, key, value);
  }

  export async function Load<T>(listName: string, key: string): Promise<T> {
    return await load(listName, key);
  }

  export async function LoadAllAndUpdateIds<T extends Listable>(
    listName: string
  ): Promise<T[]> {
    const store = localforage.createInstance({ name: listName });
    let items = [];
    await store.iterate((item: Listable, key) => {
      item.Id = key;
      items.push(item);
    });

    return items;
  }

  export async function Delete(listName: string, key: string) {
    const store = localforage.createInstance({ name: listName });

    return await store.removeItem(key);
  }

  export async function DeleteAll() {
    for (const listName of SupportedLists) {
      const store = localforage.createInstance({ name: listName });
      await store.clear();
    }
  }

  export async function GetAllKeys() {
    let storage = {};
    for (const listName of SupportedLists) {
      const store = localforage.createInstance({ name: listName });
      await store.iterate((value, key) => {
        storage[`${listName}.${key}`] = value;
      });
    }
    return storage;
  }

  export async function ImportAll(file: File) {
    let reader = new FileReader();
    reader.onload = async (event: any) => {
      let json = event.target.result;
      let importedStorage = {};
      try {
        importedStorage = JSON.parse(json);
      } catch (error) {
        alert(`There was a problem importing ${file.name}: ${error}`);
        return;
      }

      await Promise.all([
        importList(StatBlocks, importedStorage),
        importList(PersistentCharacters, importedStorage),
        importList(SavedEncounters, importedStorage),
        importList(Spells, importedStorage)
      ]);

      location.reload();
    };
    reader.readAsText(file);
  }

  async function importList(listName: string, importSource: any) {
    const listingsJSON = importSource[listName];
    if (!listingsJSON) {
      console.warn(`Couldn't import ${listName} from JSON`);
      return;
    }
    const listings: string[] = JSON.parse(listingsJSON);
    if (!listings.length) {
      return;
    }
    const savePromises = listings.map(async key => {
      const fullKey = `${listName}.${key}`;
      const listingJSON = importSource[fullKey];
      if (!listingJSON) {
        console.warn(`Couldn't import ${fullKey} from JSON`);
        return;
      } else {
        const listing: Listable = JSON.parse(listingJSON);
        listing.LastUpdateMs = moment.now();
        return Save(listName, key, listing);
      }
    });

    return Promise.all(savePromises);
  }

  async function save(listName: string, key: string, value) {
    const store = localforage.createInstance({ name: listName });
    return await store.setItem(key, value);
  }

  async function load<T>(listName: string, key: string) {
    const store = localforage.createInstance({ name: listName });
    return await store.getItem<T>(key);
  }
}
