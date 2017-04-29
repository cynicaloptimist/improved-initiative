module ImprovedInitiative {
    export class EncounterLibrary {
        Index = ko.observableArray<string>([]);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => this.Index.push(e));

            const appInsights: Client = window["appInsights"];
            appInsights.trackEvent("SavedEncounters", { Count: this.Index().length.toString() });
        }

        Save = (encounterName: string, savedEncounter: SavedEncounter<SavedCombatant>) => {
            if (this.Index().indexOf(encounterName) === -1) {
                this.Index.push(encounterName);
            }
                        
            Store.Save(Store.SavedEncounters, encounterName, savedEncounter);
        }

        Delete = (encounterName: string) => {
            this.Index.remove(encounterName);
            Store.Delete(Store.SavedEncounters, encounterName);
        }

        Get = (encounterName: string) => {
            return Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, encounterName);
        }
    }
}