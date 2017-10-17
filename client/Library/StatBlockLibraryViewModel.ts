module ImprovedInitiative {
    export interface StatBlockLibrary {
        StatBlocks: KnockoutObservableArray<Listing<StatBlock>>
        ContainsPlayerCharacters: boolean;
    }

    export class StatBlockLibraryViewModel {
        private previewStatBlock: KnockoutObservable<StatBlock> = ko.observable(null);
        constructor(
            private encounterCommander: EncounterCommander,
            private library: StatBlockLibrary
        ) {
            this.LibraryFilter.subscribe(n => {
                if (n === "") {
                    this.clearCache();
                }
            });
            this.library.StatBlocks.subscribe(this.clearCache);
         }

        LibraryFilter = ko.observable("");

        private filterCache: KeyValueSet<Listing<StatBlock>[]> = {};
        private clearCache = () => this.filterCache = {};

        FilteredStatBlocks = ko.pureComputed<Listing<StatBlock>[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                statBlocksWithFilterInName = [],
                statBlocksWithFilterInKeywords = [];

            if (this.filterCache[filter]) {
                return this.filterCache[filter];
            }

            const parentSubset = this.filterCache[filter.substr(0, filter.length - 1)] || this.library.StatBlocks();

            const dedupedStatBlocks: KeyValueSet<Listing<StatBlock>> = {};
            const sourceRankings: ListingSource[] = ["account", "localStorage", "server"];
            parentSubset.forEach(newListing => {
                const currentListing = dedupedStatBlocks[newListing.Name];
                if (currentListing) {
                    const hasBetterSource = (sourceRankings.indexOf(newListing.Source) < sourceRankings.indexOf(currentListing.Source));
                    if (hasBetterSource) {
                        dedupedStatBlocks[newListing.Name] = newListing;
                    }
                } else {
                    dedupedStatBlocks[newListing.Name] = newListing;
                }
            })
            
            Object.keys(dedupedStatBlocks).sort().forEach(i => {
                const listing = dedupedStatBlocks[i];
                if (listing.Name.toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInName.push(listing);
                }
                else if (listing.SearchHint.toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInKeywords.push(listing);
                }
            });

            const finalList = statBlocksWithFilterInName.concat(statBlocksWithFilterInKeywords);

            this.filterCache[filter] = finalList;
            
            return finalList;
        });

        ClickEntry = (entry: Listing<StatBlock>) => this.encounterCommander.AddStatBlockFromListing(entry);
        ClickEdit = (entry: Listing<StatBlock>) => this.encounterCommander.EditStatBlock(entry);
        ClickHide = () => this.encounterCommander.HideLibraries();
        ClickAdd = () => this.encounterCommander.CreateAndEditStatBlock(this.library.ContainsPlayerCharacters);

        GetPreviewStatBlock = ko.pureComputed(() => {
            return this.previewStatBlock() || StatBlock.Default();
        })

        PreviewStatBlock = (listing: Listing<StatBlock>) => {
            this.previewStatBlock(null);
            listing.GetAsync(statBlock => {
                this.previewStatBlock(statBlock);
            });
        }
    }
}