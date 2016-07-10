module ImprovedInitiative {
    export class CreatureListing {
        Name: KnockoutObservable<string>;
        IsLoaded: boolean;
        StatBlock: KnockoutObservable<IStatBlock>;
        constructor(public Id: string, name: string, public Type: string, public Link: string, public Source: string, statblock?: IStatBlock) {
            this.Name = ko.observable(name);
            this.IsLoaded = !!statblock;
            this.StatBlock = ko.observable(statblock || StatBlock.Empty(c => { c.Name = name }));
            this.StatBlock.subscribe(newStatBlock => {
                this.Name(newStatBlock.Name);
                this.Type = newStatBlock.Type;
            });
        }

        LoadStatBlock = (callback: (listing: CreatureListing) => void) => {
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

    export class CreatureLibrary {
        private previewStatBlock: KnockoutObservable<IStatBlock> = ko.observable(null);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => this.SavedEncounterIndex.push(e));
            
            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = Store.Load<IStatBlock>(Store.PlayerCharacters, id);
                this.Players.push(new CreatureListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            if (this.Players().length == 0) {
                this.AddSamplePlayersFromUrl('/sample_players.json');
            }

            Store.List(Store.Creatures).forEach(id => {
                var statBlock = Store.Load<IStatBlock>(Store.Creatures, id);
                this.Creatures.push(new CreatureListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            })
        }

        Creatures = ko.observableArray<CreatureListing>([]);
        Players = ko.observableArray<CreatureListing>([]);
        SavedEncounterIndex = ko.observableArray<string>([]);

        GetPreviewStatBlock = ko.computed(() => {
            return this.previewStatBlock() || StatBlock.Empty();
        })

        PreviewCreature = (creature: CreatureListing) => {
            this.previewStatBlock(null);
            creature.LoadStatBlock(listing => {
                this.previewStatBlock(listing.StatBlock());
            });
        }

        DisplayTab = ko.observable('Creatures');
        LibraryFilter = ko.observable('');

        FilteredCreatures = ko.computed<CreatureListing[]>(() => {
            var filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                creaturesWithFilterInName = [],
                creaturesWithFilterInType = [];
            var library = this.DisplayTab() == 'Players'
                ? ko.unwrap(this.Players)
                : ko.unwrap(this.Creatures);
                 
            if (filter.length == 0) {
                return library;
            }

            library.forEach(c => {
                if (c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInName.push(c);
                    return;
                }
                if (c.Type.toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInType.push(c);
                }
            })
            return creaturesWithFilterInName.concat(creaturesWithFilterInType);
        });

        AddCreaturesFromServer = (library) => {
            library.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll(this.Creatures, library.map(c => {
                return new CreatureListing(c.Id, c.Name, c.Type, c.Link, "server");
            }));
        }

        AddSamplePlayersFromUrl = (url: string) => {
            $.getJSON(url, (json: IStatBlock []) => {
                json.forEach((statBlock, index) => {
                    statBlock = $.extend(StatBlock.Empty(), statBlock);
                    this.Players.push(new CreatureListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        } 
    }
}