module ImprovedInitiative {
    export class LibraryViewModel {
        private previewStatBlock: KnockoutObservable<IStatBlock> = ko.observable(null);

        constructor(public EncounterCommander: EncounterCommander, private library: StatBlockLibrary) {

        }

        GetPreviewStatBlock = ko.computed(() => {
            return this.previewStatBlock() || StatBlock.Empty();
        })

        PreviewStatBlock = (listing: StatBlockListing) => {
            this.previewStatBlock(null);
            listing.LoadStatBlock(listing => {
                this.previewStatBlock(listing.StatBlock());
            });
        }

        DisplayTab = ko.observable('Creatures');
        LibraryFilter = ko.observable('');

        FilteredStatBlocks = ko.computed<StatBlockListing[]>(() => {
            var filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                statBlocksWithFilterInName = [],
                statBlocksWithFilterInType = [];
            var library = this.DisplayTab() == 'Players'
                ? ko.unwrap(this.library.PCStatBlocks)
                : ko.unwrap(this.library.NPCStatBlocks);
                 
            if (filter.length == 0) {
                return library;
            }

            library.forEach(c => {
                if (c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInName.push(c);
                    return;
                }
                if (c.Type.toLocaleLowerCase().indexOf(filter) > -1) {
                    statBlocksWithFilterInType.push(c);
                }
            })
            return statBlocksWithFilterInName.concat(statBlocksWithFilterInType);
        });
    }
}