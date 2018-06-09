import { Listable } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";
import { DnDAppFilesImporter } from "../Importers/DnDAppFilesImporter";
import { Spell } from "../../common/Spell";

export class Store {
    private static _prefix = "ImprovedInitiative";

    public static readonly PlayerCharacters = "PlayerCharacters";
    public static readonly StatBlocks = "Creatures";
    public static readonly Spells = "Spells";
    public static readonly SavedEncounters = "SavedEncounters";
    public static readonly AutoSavedEncounters = "AutoSavedEncounters";
    public static readonly User = "User";

    //Legacy
    public static readonly KeyBindings = "KeyBindings";
    public static readonly ActionBar = "ActionBar";

    public static List(listName: string): string[] {
        let listKey = `${Store._prefix}.${listName}`;
        let list = Store.load(listKey);
        if (list && list.constructor === Array) {
            return list;
        }
        Store.save(listKey, []);
        return [];
    }

    public static Save<T>(listName: string, key: string, value: T) {
        if (typeof (key) !== "string") {
            throw `Can't save to non-string key ${key}`;
        }
        let listKey = `${Store._prefix}.${listName}`;
        let fullKey = `${Store._prefix}.${listName}.${key}`;
        let list = Store.List(listName);
        if (list.indexOf(key) == -1) {
            list.push(key);
            Store.save(listKey, list);
        }
        Store.save(fullKey, value);
    }

    public static Load<T>(listName: string, key: string): T {
        let fullKey = `${Store._prefix}.${listName}.${key}`;
        return Store.load(fullKey);
    }

    public static LoadAllAndUpdateIds<T extends Listable>(listName: string): T [] {
        return Store.List(listName)
            .map(key => {
                const item = Store.Load<T>(listName, key);
                if (item) {
                    item.Id = key;
                }
                return item;
            })
            .filter(value => !!value);
    }

    public static Delete(listName: string, key: string) {
        let listKey = `${Store._prefix}.${listName}`;
        let fullKey = `${Store._prefix}.${listName}.${key}`;
        let list = Store.List(listName);
        let keyIndex = list.indexOf(key);
        if (keyIndex != -1) {
            list.splice(keyIndex, 1);
            Store.save(listKey, list);
        }
        localStorage.removeItem(fullKey);
    }

    public static ExportAll() {
        return new Blob([JSON.stringify(localStorage, null, 2)],
            { type: "application/json" });
    }

    public static ImportAll(file: File) {
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
            if (confirm(`Replace your Improved Initiative data with imported ${file.name} and reload?`)) {
                localStorage.clear();
                for (let key in importedStorage) {
                    localStorage.setItem(key, importedStorage[key]);
                }
                location.reload();
            }
        };
        reader.readAsText(file);
    }

    public static ImportFromDnDAppFile(file: File) {
        const statBlocksCallback = (statBlocks: StatBlock[]) => {
            statBlocks.forEach(c => {
                this.Save(Store.StatBlocks, c.Id, c);
            });
        };

        const spellsCallback = (spells: Spell[]) => {
            spells.forEach(c => {
                this.Save(Store.Spells, c.Id, c);
            });
        };

        if (confirm(`Import all statblocks and spells in ${file.name} and reload?`)) {
            const importer = new DnDAppFilesImporter();

            importer.ImportEntitiesFromXml(file, statBlocksCallback, spellsCallback);
        }
    }

    public static ExportStatBlocks() {
        let statBlocks = this.List(Store.StatBlocks).map(id => Store.Load(Store.StatBlocks, id));
        return new Blob([JSON.stringify(statBlocks, null, 2)],
            { type: "application/json" });
    }

    private static save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    private static load = (key) => {
        let value = localStorage.getItem(key);
        if (value === "undefined") { return null; }
        return JSON.parse(value);
    }
}
