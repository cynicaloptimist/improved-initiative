module ImprovedInitiative {
    export class Store {
        private static _prefix = "ImprovedInitiative";

        static PlayerCharacters: string = "PlayerCharacters";
        static Creatures: string = "Creatures";
        static SavedEncounters: string = "SavedEncounters";
        static User: string = "User";
        static KeyBindings: string = "KeyBindings";
        static ActionBar: string = "ActionBar";

        static List(listName: string): string[] {
            var listKey = `${Store._prefix}.${listName}`;
            var list = Store.load(listKey);
            if (list && list.constructor === Array) {
                return list;
            }
            Store.save(listKey, []);
            return [];
        }

        static Save<T>(listName: string, key: string, value: T) {
            if (typeof (key) !== "string") {
                throw `Can't save to non-string key ${key}`;
            }
            var listKey = `${Store._prefix}.${listName}`;
            var fullKey = `${Store._prefix}.${listName}.${key}`;
            var list = Store.List(listName);
            if (list.indexOf(key) == -1) {
                list.push(key);
                Store.save(listKey, list);
            }
            Store.save(fullKey, value);
        }

        static Load<T>(listName: string, key: string): T {
            var fullKey = `${Store._prefix}.${listName}.${key}`;
            return Store.load(fullKey);
        }

        static Delete<T>(listName: string, key: string) {
            var listKey = `${Store._prefix}.${listName}`;
            var fullKey = `${Store._prefix}.${listName}.${key}`;
            var list = Store.List(listName);
            var keyIndex = list.indexOf(key);
            if (keyIndex != -1) {
                list.splice(keyIndex, 1);
                Store.save(listKey, list);
            }
            localStorage.removeItem(fullKey);
        }

        static ExportAll() {
            return new Blob([JSON.stringify(localStorage, null, 2)],
                { type: 'application/json' });
        }

        static ImportAll(file: File) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
                var json = event.target.result;
                try {
                    var importedStorage = JSON.parse(json);
                } catch (error) {
                    alert(`There was a problem importing ${file.name}: ${error}`);
                    return;
                }
                if (confirm(`Replace your Improved Initiative data with imported ${file.name} and reload?`)) {
                    localStorage.clear();
                    for (var key in importedStorage) {
                        localStorage.setItem(key, importedStorage[key]);
                    }
                    location.reload();
                }
            };
            reader.readAsText(file);
        }

        static ImportFromDnDAppFile(file: File) {
            var callback = (creatures: IStatBlock[]) => {
                creatures.forEach(c => {
                    this.Save(Store.Creatures, c.Name, c);
                });
            };

            if (confirm(`Import all creatures in ${file.name} and reload?`)) {
                try {
                    new DnDAppFilesImporter().ImportFromXml(file, callback);
                    location.reload();
                } catch (error) {
                    alert(`There was a problem importing ${file.name}: ${error}`);
                    return;
                }
            }
        }

        static ExportCreatures() {
            var creatures = this.List(Store.Creatures).map(id => Store.Load(Store.Creatures, id));
            return new Blob([JSON.stringify(creatures, null, 2)],
                { type: 'application/json' });
        }

        private static save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
        private static load = (key) => {
            var value = localStorage.getItem(key);
            if (value === "undefined") { return null; }
            return JSON.parse(value);
        };
    }
}