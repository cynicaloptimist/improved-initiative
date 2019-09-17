import * as localforage from "localforage";

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
    reader.onload = (event: any) => {
      let json = event.target.result;
      let importedStorage = {};
      try {
        importedStorage = JSON.parse(json);
      } catch (error) {
        alert(`There was a problem importing ${file.name}: ${error}`);
        return;
      }

      importList(StatBlocks, importedStorage);
      importList(PersistentCharacters, importedStorage);
      importList(SavedEncounters, importedStorage);
      importList(Spells, importedStorage);

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
    for (const key of listings) {
      const fullKey = `${listName}.${key}`;
      const listingJSON = importSource[fullKey];
      if (!listingJSON) {
        console.warn(`Couldn't import ${fullKey} from JSON`);
      } else {
        const listing = JSON.parse(listingJSON);
        Save(listName, key, listing);
      }
    }
  }

  export async function ImportAllAndReplace(file: File) {
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
      if (
        confirm(
          `Replace your Improved Initiative data with imported ${
            file.name
          } and reload?`
        )
      ) {
        await DeleteAll();
        let promises = [];
        for (let fullKey in importedStorage) {
          const [listName, key] = fullKey.split(".");
          const store = localforage.createInstance({ name: listName });
          promises.push(store.setItem(key, importedStorage[key]));
        }
        await Promise.all(promises);
        location.reload();
      }
    };
    reader.readAsText(file);
  }

  export async function ImportFromDnDAppFile(file: File) {
    const statBlocksCallback = (statBlocks: StatBlock[]) => {
      statBlocks.forEach(c => {
        Save(Store.StatBlocks, c.Id, c);
      });
    };

    const spellsCallback = (spells: Spell[]) => {
      spells.forEach(c => {
        Save(Store.Spells, c.Id, c);
      });
    };

    if (
      confirm(`Import all statblocks and spells in ${file.name} and reload?`)
    ) {
      const importer = new DnDAppFilesImporter();

      importer.ImportEntitiesFromXml(file, statBlocksCallback, spellsCallback);
    }
  }

  export async function ExportStatBlocks() {
    let statBlocks = await LoadAllAndUpdateIds(StatBlocks);
    return new Blob([JSON.stringify(statBlocks, null, 2)], {
      type: "application/json"
    });
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
