module ImprovedInitiative {
    export class EncounterLibrary {
        Index = ko.observableArray<Listing<SavedEncounter<SavedCombatant>>>([]);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => {
                const encounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, e);
                const listing = listingFrom(encounter, e);
                this.Index.push(listing);
            });

            Metrics.TrackEvent("SavedEncounters", { Count: this.Index().length.toString() });
        }

        Save = (savedEncounter: SavedEncounter<SavedCombatant>) => {
            const listing = listingFrom(savedEncounter);

            if (this.Index().indexOf(listing) === -1) {
                this.Index.push(listing);
            }

            Store.Save(Store.SavedEncounters, listing.Id, savedEncounter);
        }

        DeleteByName = (encounterName: string) => {
            let encounterId = encounterName;
            this.Index.remove(e => {
                if (e.Name === encounterName) {
                    encounterId = e.Id;
                    return true;
                }
                return false;
            });
            Store.Delete(Store.SavedEncounters, encounterId);
        }

        Get = (encounterName: string, callBack: (encounter: SavedEncounter<SavedCombatant>) => void) => {
            const listing = this.Index().filter(e => e.CurrentName() == encounterName)[0];
            listing.GetAsync(callBack);
        }
    }

    function listingFrom(savedEncounter: SavedEncounter<SavedCombatant>, encounterId?: string) {
        const listingId = encounterId || probablyUniqueString();
        const combatantNames = savedEncounter.Combatants.map(c => c.Alias).join(" ");
        return new Listing<SavedEncounter<SavedCombatant>>(
            listingId,
            savedEncounter.Name,
            combatantNames,
            Store.SavedEncounters,
            'localStorage');
    }
}