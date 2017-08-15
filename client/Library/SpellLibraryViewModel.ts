module ImprovedInitiative {
    export class SpellLibraryViewModel {
        constructor(
            private encounterCommander: EncounterCommander,
            private library: SpellLibrary
        ) { }

        LibraryFilter = ko.observable("");

        FilteredSpells = ko.pureComputed<SpellListing[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                spellsWithFilterInName = [],
                spellsWithFilterInKeywords = [];

            if (filter.length == 0) {
                return this.library.Spells();
            }

            this.library.Spells().forEach(c => {
                if (c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                    spellsWithFilterInName.push(c);
                    return;
                }
                if (c.Keywords.toLocaleLowerCase().indexOf(filter) > -1) {
                    spellsWithFilterInKeywords.push(c);
                }
            })
            return spellsWithFilterInName.concat(spellsWithFilterInKeywords);
        });

        ClickEntry = (entry: SpellListing) => this.encounterCommander.ReferenceSpell(entry);
        ClickEdit = (entry: SpellListing) => this.encounterCommander.EditSpell(entry);
        ClickHide = () => this.encounterCommander.HideLibraries();
        ClickAdd = () => this.encounterCommander.CreateAndEditSpell();
    }
}