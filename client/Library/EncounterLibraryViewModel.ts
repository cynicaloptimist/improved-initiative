module ImprovedInitiative {
    type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;
    export class EncounterLibraryViewModel {
        constructor(
            private tracker: TrackerViewModel,
            private library: EncounterLibrary
        ) {
            this.LibraryFilter.subscribe(n => {
                if (n === "") {
                    this.clearCache();
                }
            });
            this.library.Encounters.subscribe(this.clearCache);
        }

        LibraryFilter = ko.observable("");

        private filterCache: KeyValueSet<EncounterListing[]> = {};
        private clearCache = () => this.filterCache = {};

        FilteredEncounters = ko.pureComputed<EncounterListing[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                encounters = this.library.Encounters();

            if (this.filterCache[filter]) {
                return this.filterCache[filter];
            }

            const parentSubset = this.filterCache[filter.substr(0, filter.length - 1)] || encounters;

            const finalList = DedupeByRankAndFilterListings(parentSubset, filter);

            this.filterCache[filter] = finalList;

            return finalList;
        });

        LoadEncounter = (listing: EncounterListing) => {
            listing.GetAsync(encounter => {
                this.tracker.Encounter.LoadSavedEncounter(encounter, this.tracker.PromptQueue);
                this.tracker.EventLog.AddEvent(`Encounter loaded.`);
            });
        }

        DeleteSavedEncounter = (listing: EncounterListing) => {
            if (confirm(`Delete saved encounter "${listing.CurrentName()}"? This cannot be undone.`)) {
                this.library.Delete(listing);
                this.tracker.EventLog.AddEvent(`Encounter ${listing.CurrentName()} deleted.`);
            }
        }

        ClickEntry = (listing: EncounterListing) => this.LoadEncounter(listing);
        ClickDelete = (listing: EncounterListing) => this.DeleteSavedEncounter(listing);
        ClickHide = () => this.tracker.LibrariesVisible(false);
        ClickAdd = () => this.tracker.EncounterCommander.SaveEncounter();
    }
}