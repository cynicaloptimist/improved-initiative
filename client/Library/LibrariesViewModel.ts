module ImprovedInitiative {
    export class NPCLibraryViewModel {
        private previewStatBlock: KnockoutObservable<StatBlock> = ko.observable(null);
        constructor(
            private encounterCommander: EncounterCommander,
            private library: NPCLibrary
        ) { }

        LibraryFilter = ko.observable("");

        FilteredStatBlocks = ko.pureComputed<StatBlockListing[]>(() => {
            const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                statBlocksWithFilterInName = [],
                statBlocksWithFilterInKeywords = [];
                 
            if (filter.length == 0) {
                return this.library.StatBlocks();
            }

            this.library.StatBlocks().forEach(c => {
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
        ClickAdd = () => this.encounterCommander.CreateAndEditStatBlock(false);

        GetPreviewStatBlock = ko.pureComputed(() => {
            return this.previewStatBlock() || StatBlock.Default();
        })

        PreviewStatBlock = (listing: StatBlockListing) => {
            this.previewStatBlock(null);
            listing.LoadStatBlock(listing => {
                this.previewStatBlock(listing.StatBlock());
            });
        }
    }
    
    export class LibrariesViewModel {

        constructor(public EncounterCommander: EncounterCommander) { }

        Libraries = [
            {
                Name: "Creatures",
                Component: "npclibrary"                
            }
        ];

        SelectedLibrary = ko.observable(this.Libraries[0]);

        TabClassName = library => library === this.SelectedLibrary() ? 'selected' : '';

        LibraryComponent = () => this.SelectedLibrary().Component;
    }
}