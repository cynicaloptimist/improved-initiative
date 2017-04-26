module ImprovedInitiative {
    export class LibrariesViewModel {
        private previewStatBlock: KnockoutObservable<StatBlock> = ko.observable(null);

        constructor(
            public EncounterCommander: EncounterCommander,
            private npcLibrary: NPCLibrary,
            private pcLibrary: PCLibrary,
            private encounterLibrary: EncounterLibrary) {
            this.SavedEncounterIndex = encounterLibrary.SavedEncounterIndex;
        }

        SavedEncounterIndex: KnockoutObservableArray<string>;

        GetPreviewStatBlock = ko.pureComputed(() => {
            return this.previewStatBlock() || StatBlock.Default();
        })

        PreviewStatBlock = (listing: StatBlockListing) => {
            this.previewStatBlock(null);
            listing.LoadStatBlock(listing => {
                this.previewStatBlock(listing.StatBlock());
            });
        }

        DisplayTab = ko.observable('Creatures');
        LibraryFilter = ko.observable('');

        ChangeTab = tabName => () => {
            if (tabName === 'Players') {
                TutorialSpy('SelectPlayersTab');
            }
            this.DisplayTab(tabName);
        }
        
        FilteredStatBlocks = ko.pureComputed<StatBlockListing[]>(() => {
            var filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                statBlocksWithFilterInName = [],
                statBlocksWithFilterInKeywords = [];
            var library = this.DisplayTab() == 'Players'
                ? ko.unwrap(this.pcLibrary.StatBlocks)
                : ko.unwrap(this.npcLibrary.StatBlocks);
                 
            if (filter.length == 0) {
                return library;
            }

            library.forEach(c => {
                if (c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInName.push(c);
                    return;
                }
                if (c.Keywords.toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInKeywords.push(c);
                }
            })
            return statBlocksWithFilterInName.concat(statBlocksWithFilterInKeywords);
        });
    }
}