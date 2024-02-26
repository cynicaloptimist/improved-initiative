import * as localforage from "localforage";

import * as moment from "moment";
import * as _ from "lodash";

import { Listable } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { DnDAppFilesImporter } from "../Importers/DnDAppFilesImporter";
import { Listing } from "../Library/Listing";

export namespace Store {
  export const PersistentCharacters = "PersistentCharacters";
  export const StatBlocks = "Creatures";
  export const Spells = "Spells";
  export const SavedEncounters = "SavedEncounters";

  export const SupportedLists = [
    StatBlocks,
    Spells,
    PersistentCharacters,
    SavedEncounters
  ];

  export async function Save<T>(
    listName: string,
    key: string,
    value: T
  ): Promise<void> {
    if (typeof key !== "string") {
      throw `Can't save to non-string key ${key}`;
    }
    await save(listName, key, value);
  }

  export async function Load<T>(listName: string, key: string): Promise<T> {
    return await load(listName, key);
  }

  export async function Count(listName: string): Promise<number> {
    const store = localforage.createInstance({ name: listName });
    return await store.length();
  }

  export async function LoadAllAndUpdateIds<T extends Listable>(
    listName: string,
    getDefault: () => T
  ): Promise<T[]> {
    const store = localforage.createInstance({ name: listName });
    const items: T[] = [];
    await store.iterate((item: Partial<T>, key) => {
      const filledItem = {
        ...getDefault(),
        ...item,
        Id: key
      };

      items.push(filledItem);
    });

    console.log(`loaded ${items.length} items from ${listName}`);

    return items;
  }

  export async function Delete(listName: string, key: string): Promise<void> {
    const store = localforage.createInstance({ name: listName });

    return await store.removeItem(key);
  }

  export async function DeleteAll(): Promise<void> {
    for (const listName of SupportedLists) {
      const store = localforage.createInstance({ name: listName });
      await store.clear();
    }
  }

  export async function GetAllKeyPairs(): Promise<Record<string, unknown>> {
    const storage = {};
    for (const listName of SupportedLists) {
      const store = localforage.createInstance({ name: listName });
      await store.iterate((value, key) => {
        storage[`${listName}.${key}`] = value;
      });
    }
    return storage;
  }

  export async function ImportAll(file: File): Promise<void> {
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
    const listingFullKeys = Object.keys(importSource).filter(k =>
      k.startsWith(listName + ".")
    );
    const savePromises = listingFullKeys.map(async fullKey => {
      const listing = importSource[fullKey];
      if (!listing) {
        console.warn(`Couldn't import ${fullKey} from JSON`);
        return;
      } else {
        listing.LastUpdateMs = moment.now();
        const key = _.last(fullKey.split("."));
        if (key) {
          await Save(listName, key, listing);
        }
      }
    });

    return Promise.all(savePromises);
  }

  export function ImportFromDnDAppFile(file: File): void {
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

  export async function ExportListings(
    listings: Listing<Listable>[],
    listName: string
  ): Promise<Blob> {
    const exportedListings = {};

    exportedListings[listName] = listings.map(l => l.Meta().Id);

    for (const listing of listings) {
      const fullKey = `${listName}.${listing.Meta().Id}`;
      exportedListings[fullKey] = await listing.GetWithTemplate({
        ...listing.Meta(),
        Version: process.env.VERSION
      });
    }

    return new Blob([JSON.stringify(exportedListings, null, 2)], {
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
