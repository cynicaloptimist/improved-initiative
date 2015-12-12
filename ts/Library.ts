module ImprovedInitiative {
	export class CreatureListing {
        Id: string;
        Name: KnockoutObservable<string>;
        Type: string;
        Link: string;
        IsLoaded: boolean;
        StatBlock: KnockoutObservable<IStatBlock>;
        constructor(id: string, name: string, type: string, link: string, statblock?: IStatBlock){
            this.Id = id;
            this.Name = ko.observable(name);
            this.Type = type;
            this.Link = link;
            this.IsLoaded = !!statblock;
            this.StatBlock = ko.observable(statblock || StatBlock.Empty(c => {c.Name = name}));
        }
        
        LoadStatBlock = (callback: (listing: CreatureListing) => void) => {
            if(this.IsLoaded){
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
        
        constructor () {
            Store.List('SavedEncounters').forEach(e => this.SavedEncounterIndex.push(e));
            Store.List('PlayerCharacters').forEach(name => {
                var statBlock = Store.Load<IStatBlock>('PlayerCharacters', name);
                this.Players.push(new CreatureListing (null, statBlock.Name, statBlock.Type, null, statBlock));
            });
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
        
        FilteredCreatures = ko.computed<CreatureListing []>(() => {
            var creatures = ko.unwrap(this.Creatures),
                players = ko.unwrap(this.Players),
                filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
                creaturesWithFilterInName = [],
                creaturesWithFilterInType = [];
        
            if(this.DisplayTab() == 'Players'){
                return players;
            }
            if(filter.length == 0){
                return creatures;
            }
            
            creatures.forEach(c => {
                if(c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInName.push(c);
                    return;
                }
                if(c.Type.toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInType.push(c);
                }
            })
            return creaturesWithFilterInName.concat(creaturesWithFilterInType);
        });
    
        AddPlayers = (library) => {
            ko.utils.arrayPushAll(this.Players, library.map(c => {
                return new CreatureListing(c.Id, c.Name, c.Type, c.Link);
            }));
        }
        
        AddCreatures = (library) =>  {
            library.sort((c1,c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll(this.Creatures, library.map(c => {
                return new CreatureListing(c.Id, c.Name, c.Type, c.Link);
            }));
        }
	}
}