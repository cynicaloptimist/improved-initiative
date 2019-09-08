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

  export async function List(listName: string): Promise<string[]> {
    let list = await load<string[]>(listName);
    if (list && list.constructor === Array) {
      return list;
    }
    await save(listName, []);
    return [];
  }

  export async function Save<T>(listName: string, key: string, value: T) {
    if (typeof key !== "string") {
      throw `Can't save to non-string key ${key}`;
    }
    let fullKey = `${listName}.${key}`;
    let list = await Store.List(listName);
    if (list.indexOf(key) == -1) {
      list.push(key);
      save(listName, list);
    }
    save(fullKey, value);
  }

  export async function Load<T>(listName: string, key: string): Promise<T> {
    let fullKey = `${listName}.${key}`;
    return await load(fullKey);
  }

  export async function LoadAllAndUpdateIds<T extends Listable>(
    listName: string
  ): Promise<T[]> {
    const listings = await Store.List(listName);
    const updatedItems = listings
      .map<Promise<T>>(async key => {
        const item = await Store.Load<T>(listName, key);

        if (item) {
          item.Id = key;
        }
        return item;
      })
      .filter(value => !!value);

    return Promise.all(updatedItems);
  }

  export async function Delete(listName: string, key: string) {
    let fullKey = `${listName}.${key}`;
    let list = await Store.List(listName);
    let keyIndex = list.indexOf(key);
    if (keyIndex != -1) {
      list.splice(keyIndex, 1);
      save(listName, list);
    }
    return await localforage.removeItem(fullKey);
  }

  export async function DeleteAll() {
    await localforage.clear();
    location.reload();
  }

  export async function ExportAll() {
    let storage = {};
    await localforage.iterate((value, key) => {
      storage[key] = value;
    });

    return new Blob([JSON.stringify(storage, null, 2)], {
      type: "application/json"
    });
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

      importList(Store.StatBlocks, importedStorage);
      importList(Store.PersistentCharacters, importedStorage);
      importList(SavedEncounters, importedStorage);
      importList(Store.Spells, importedStorage);

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
        await localforage.clear();
        let promises = [];
        for (let key in importedStorage) {
          promises.push(localforage.setItem(key, importedStorage[key]));
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
    const listings = await List(Store.StatBlocks);
    let statBlocks = listings.map(id => Store.Load(Store.StatBlocks, id));
    return new Blob([JSON.stringify(statBlocks, null, 2)], {
      type: "application/json"
    });
  }

  async function save(key, value) {
    return localforage.setItem(key, value);
  }

  async function load<T>(key: string) {
    return await localforage.getItem<T>(key);
  }
}
