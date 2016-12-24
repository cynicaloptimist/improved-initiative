module ImprovedInitiative {
    export class StatBlockListing {
        Name: KnockoutObservable<string>;
        IsLoaded: boolean;
        StatBlock: KnockoutObservable<IStatBlock>;
        constructor(public Id: string, name: string, public Type: string, public Link: string, public Source: string, statBlock?: IStatBlock) {
            this.Name = ko.observable(name);
            this.IsLoaded = !!statBlock;
            this.StatBlock = ko.observable(statBlock || StatBlock.Empty(c => { c.Name = name }));
            this.StatBlock.subscribe(newStatBlock => {
                this.Name(newStatBlock.Name);
                this.Type = newStatBlock.Type;
            });
        }

        LoadStatBlock = (callback: (listing: StatBlockListing) => void) => {
            if (this.IsLoaded) {
                callback(this);
            }
            else {
                $.getJSON(this.Link, (json) => {
                    this.IsLoaded = true;
                    this.StatBlock($.extend(StatBlock.Empty(), json));
                    callback(this);
                });
            }
        }
    }

    export class StatBlockLibrary {
        private previewStatBlock: KnockoutObservable<IStatBlock> = ko.observable(null);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => this.SavedEncounterIndex.push(e));
            
            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = $.extend(StatBlock.Empty(), Store.Load<IStatBlock>(Store.PlayerCharacters, id));
                this.PCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            if (this.PCStatBlocks().length == 0) {
                this.AddSamplePlayersFromUrl('/sample_players.json');
            }

            Store.List(Store.StatBlocks).forEach(id => {
                var statBlock = $.extend(StatBlock.Empty(), Store.Load<IStatBlock>(Store.StatBlocks, id));
                this.NPCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            })
        }

        NPCStatBlocks = ko.observableArray<StatBlockListing>([]);
        PCStatBlocks = ko.observableArray<StatBlockListing>([]);
        SavedEncounterIndex = ko.observableArray<string>([]);

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
                ? ko.unwrap(this.PCStatBlocks)
                : ko.unwrap(this.NPCStatBlocks);
                 
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

        AddStatBlocksFromServer = (library) => {
            library.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll(this.NPCStatBlocks, library.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Type, c.Link, "server");
            }));
        }

        AddSamplePlayersFromUrl = (url: string) => {
            $.getJSON(url, (json: IStatBlock []) => {
                json.forEach((statBlock, index) => {
                    statBlock = $.extend(StatBlock.Empty(), statBlock);
                    this.PCStatBlocks.push(new StatBlockListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        } 
    }
}