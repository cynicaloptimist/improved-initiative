import moment = require("moment");
import { Listable } from "../../common/Listable";
import { Store } from "./Store";

const _prefix = "ImprovedInitiative";
export namespace LegacySynchronousLocalStore {
  export const PersistentCharacters = "PersistentCharacters";
  export const PlayerCharacters = "PlayerCharacters";
  export const SavedEncounters = "SavedEncounters";
  export const AutoSavedEncounters = "AutoSavedEncounters";
  export const User = "User";

  export const DefaultSavedEncounterId = "default";

  //Legacy
  export const KeyBindings = "KeyBindings";
  export const ActionBar = "ActionBar";

  export async function MigrateItemsToStore() {
    const allSaveItemPromises: Promise<void>[] = [];
    for (const listName of Store.SupportedLists) {
      const allItems = LoadAllAndUpdateIds(listName);
      const saveItemPromises = allItems.map(async item => {
        await Store.Save(listName, item.Id, item);
        Delete(listName, item.Id);
        return;
      });
      allSaveItemPromises.push(...saveItemPromises);
    }
    return await Promise.all(allSaveItemPromises);
  }

  export function List(listName: string): string[] {
    let listKey = `${_prefix}.${listName}`;
    let list = load(listKey);
    if (list && list.constructor === Array) {
      return list;
    }
    save(listKey, []);
    return [];
  }

  export function Save<T>(listName: string, key: string, value: T) {
    if (typeof key !== "string") {
      throw `Can't save to non-string key ${key}`;
    }
    let listKey = `${_prefix}.${listName}`;
    let fullKey = `${_prefix}.${listName}.${key}`;
    let list = LegacySynchronousLocalStore.List(listName);
    if (list.indexOf(key) == -1) {
      list.push(key);
      save(listKey, list);
    }
    save(fullKey, value);
  }

  export function Load<T>(listName: string, key: string): T {
    let fullKey = `${_prefix}.${listName}.${key}`;
    return load(fullKey);
  }

  export function LoadAllAndUpdateIds<T extends Listable>(
    listName: string
  ): T[] {
    return LegacySynchronousLocalStore.List(listName)
      .map(key => {
        const item = LegacySynchronousLocalStore.Load<T>(listName, key);
        if (item) {
          item.Id = key;
        }
        return item;
      })
      .filter(value => !!value);
  }

  export function Delete(listName: string, key: string) {
    let listKey = `${_prefix}.${listName}`;
    let fullKey = `${_prefix}.${listName}.${key}`;
    let list = LegacySynchronousLocalStore.List(listName);
    let keyIndex = list.indexOf(key);
    if (keyIndex != -1) {
      list.splice(keyIndex, 1);
      save(listKey, list);
    }
    localStorage.removeItem(fullKey);
  }

  export function DeleteAll() {
    localStorage.clear();
  }

  export function ExportAll(additionalKeys: { [key: string]: any }) {
    const allData = {
      ...localStorage,
      ...additionalKeys
    };
    return new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json"
    });
  }

  export function ImportAll(file: File) {
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
      importList(
        LegacySynchronousLocalStore.PersistentCharacters,
        importedStorage
      );
      importList(SavedEncounters, importedStorage);
      importList(Store.Spells, importedStorage);
    };
    reader.readAsText(file);
  }

  function importList(listName: string, importSource: any) {
    const listKey = `${_prefix}.${listName}`;
    const listingsJSON = importSource[listKey];
    if (!listingsJSON) {
      console.warn(`Couldn't import ${listName} from JSON`);
      return;
    }
    const listings: string[] = JSON.parse(listingsJSON);
    for (const key of listings) {
      const fullKey = `${_prefix}.${listName}.${key}`;
      const listingJSON = importSource[fullKey];
      if (!listingJSON) {
        console.warn(`Couldn't import ${fullKey} from JSON`);
      } else {
        const listing: Listable = JSON.parse(listingJSON);
        listing.LastUpdateMs = moment.now();
        Save(listName, key, listing);
      }
    }
  }

  export function ImportAllAndReplace(file: File) {
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
      localStorage.clear();
      for (let key in importedStorage) {
        if (key.startsWith(_prefix)) {
          localStorage.setItem(key, importedStorage[key]);
        }
      }
    };
    reader.readAsText(file);
  }

  function save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function load(key: string) {
    let value = localStorage.getItem(key);
    if (value === "undefined" || value == null) {
      return null;
    }
    return JSON.parse(value);
  }
}
