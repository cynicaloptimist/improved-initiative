module ImprovedInitiative {
    export class EncounterLibrary {
        Encounters = ko.observableArray<Listing<SavedEncounter<SavedCombatant>>>([]);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => {
                const encounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, e);
                const listing = listingFrom(encounter, e);
                this.Encounters.push(listing);
            });

            Metrics.TrackEvent("SavedEncounters", { Count: this.Encounters().length.toString() });
        }

        Save = (savedEncounter: SavedEncounter<SavedCombatant>) => {
            const listing = listingFrom(savedEncounter);

            if (this.Encounters().indexOf(listing) === -1) {
                this.Encounters.push(listing);
            }
            
            Store.Save(Store.SavedEncounters, listing.Id, savedEncounter);
        }

        Delete = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            this.Encounters.remove(listing);
            Store.Delete(Store.SavedEncounters, listing.Id);
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