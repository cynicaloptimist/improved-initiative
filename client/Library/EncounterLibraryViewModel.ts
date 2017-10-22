module ImprovedInitiative {
    export class EncounterLibraryViewModel {
        constructor(
            private encounterCommander: EncounterCommander,
            private library: EncounterLibrary
        ) { }

        LibraryFilter = ko.observable("");

        FilteredEncounters = ko.pureComputed<string []>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                index = this.library.Index().map(i => i.CurrentName());
                 
            if (filter.length == 0) {
                return index;
            }

            //TODO: Use SearchHint for this filter and return listings
            return index.filter(listing => listing.toLocaleLowerCase().indexOf(filter) > -1);
        });

        ClickEntry = (name: string) => this.encounterCommander.LoadEncounterByName(name);
        ClickDelete = (name: string) => this.encounterCommander.DeleteSavedEncounter(name);
        ClickHide = () => this.encounterCommander.HideLibraries();
        ClickAdd = () => this.encounterCommander.SaveEncounter();
    }
}