module ImprovedInitiative {
    export class SpellLibraryViewModel {
        constructor(
            private encounterCommander: EncounterCommander,
            private library: SpellLibrary
        ) { }

        LibraryFilter = ko.observable("");

        FilteredSpells = ko.pureComputed<Listing<Spell>[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                spellsWithFilterInName = [],
                spellsWithFilterInKeywords = [];
                 
            if (filter.length == 0) {
                return this.library.Spells();
            }

            this.library.Spells().forEach(c => {
                if (c.CurrentName().toLocaleLowerCase().indexOf(filter) > -1) {
                    spellsWithFilterInName.push(c);
                    return;
                }
                if (c.SearchHint.toLocaleLowerCase().indexOf(filter) > -1) {
                    spellsWithFilterInKeywords.push(c);
                }
            })
            return spellsWithFilterInName.concat(spellsWithFilterInKeywords);
        });

        ClickEntry = (entry: Listing<Spell>) => this.encounterCommander.ReferenceSpell(entry);
        ClickEdit = (entry: Listing<Spell>) => this.encounterCommander.EditSpell(entry);
        ClickHide = () => this.encounterCommander.HideLibraries();
        ClickAdd = () => this.encounterCommander.CreateAndEditSpell();
    }
}