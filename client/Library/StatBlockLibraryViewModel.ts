module ImprovedInitiative {
    export interface StatBlockLibrary {
        StatBlocks: KnockoutObservableArray<StatBlockListing>
        ContainsPlayerCharacters: boolean;
    }
    
    export class StatBlockLibraryViewModel {
        private previewStatBlock: KnockoutObservable<StatBlock> = ko.observable(null);
        constructor(
            private encounterCommander: EncounterCommander,
            private library: StatBlockLibrary
        ) { }

        LibraryFilter = ko.observable("");

        FilteredStatBlocks = ko.pureComputed<StatBlockListing[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                statBlocksWithFilterInName = [],
                statBlocksWithFilterInKeywords = [];
                 
            const sortOrder: EntitySource[] = ["account", "localStorage", "server"];
            const sortedStatBlocks = this.library.StatBlocks().sort(
                (a, b) => {
                    if (a.Source == b.Source) {
                        return a.Name().localeCompare(b.Name());
                    }
                    return sortOrder.indexOf(a.Source) - sortOrder.indexOf(b.Source);
                }
            )

            sortedStatBlocks.forEach(c => {
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

        ClickEntry = (entry: StatBlockListing) => this.encounterCommander.AddStatBlockFromListing(entry);
        ClickEdit = (entry: StatBlockListing) => this.encounterCommander.EditStatBlock(entry);
        ClickHide = () => this.encounterCommander.HideLibraries();
        ClickAdd = () => this.encounterCommander.CreateAndEditStatBlock(this.library.ContainsPlayerCharacters);

        GetPreviewStatBlock = ko.pureComputed(() => {
            return this.previewStatBlock() || StatBlock.Default();
        })

        PreviewStatBlock = (listing: StatBlockListing) => {
            this.previewStatBlock(null);
            listing.GetStatBlockAsync(statBlock => {
                this.previewStatBlock(statBlock);
            });
        }
    }
}