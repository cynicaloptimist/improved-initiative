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

  export const SupportedLists = [StatBlocks, Spells];

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
    const items: T[] = [];
    await store.iterate((item: T, key) => {
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
    const storage = {};
    for (const listName of SupportedLists) {
      const store = localforage.createInstance({ name: listName });
      await store.iterate((value, key) => {
        storage[`${listName}.${key}`] = value;
      });
    }
    return storage;
  }

  export async function ImportAll(file: File) {
    return new Promise<void>((done, fail) => {
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const json = event.target.result;
        let importedStorage = {};
        try {
          importedStorage = JSON.parse(json);
        } catch (error) {
          alert(`There was a problem importing ${file.name}: ${error}`);
          return fail();
        }

        await Promise.all([
          importList(StatBlocks, importedStorage),
          importList(PersistentCharacters, importedStorage),
          importList(SavedEncounters, importedStorage),
          importList(Spells, importedStorage)
        ]);

        done();
      };

      reader.readAsText(file);
    });
  }

  async function importList(listName: string, importSource: any) {
    const listings = Object.keys(importSource).filter(k =>
      k.startsWith(listName + ".")
    );
    const savePromises = listings.map(async key => {
      const listing = importSource[key];
      if (!listing) {
        console.warn(`Couldn't import ${key} from JSON`);
        return;
      } else {
        listing.LastUpdateMs = moment.now();
        return await Save(listName, key, listing);
      }
    });

    return Promise.all(savePromises);
  }

  export function ImportFromDnDAppFile(file: File) {
    const statBlocksCallback = async (statBlocks: StatBlock[]) => {
      await Promise.all(
        statBlocks.map(statBlock =>
          Save(Store.StatBlocks, statBlock.Id, statBlock)
        )
      );
    };

    const spellsCallback = async (spells: Spell[]) => {
      await Promise.all(
        spells.map(spell => Save(Store.Spells, spell.Id, spell))
      );
    };

    const importer = new DnDAppFilesImporter();

    importer.ImportEntitiesFromXml(file, statBlocksCallback, spellsCallback);
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
