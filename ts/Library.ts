module ImprovedInitiative {
	export class CreatureListing {
        Id: string;
        Name: string;
        Type: string;
        IsLoaded: boolean;
        StatBlock: KnockoutObservable<IStatBlock>;
        constructor(id, name, type){
            this.Id = id;
            this.Name = name;
            this.Type = type;
            this.IsLoaded = false;
            this.StatBlock = ko.observable(StatBlock.Empty(c => {c.Name = name}));
        }
        
        LoadStatBlock = (callback: (CreatureListing) => void) => {
            $.getJSON(`/creatures/${this.Id}`, (json) => {
                this.IsLoaded = true;
                this.StatBlock(json);
                callback(this);
            })
        }
    }
    
	export class CreatureLibrary {
		constructor (private StatBlockEditor: IStatBlockEditor) {
			var savedEncounterList = localStorage.getItem('ImprovedInitiative.SavedEncounters');
            if(savedEncounterList && savedEncounterList != 'undefined'){
                JSON.parse(savedEncounterList).forEach(e => this.SavedEncounterIndex.push(e));
            }
		}
        Creatures = ko.observableArray<CreatureListing>([]);
        Players = ko.observableArray<CreatureListing>([]);
        SavedEncounterIndex = ko.observableArray<string>([]);
        
        private previewStatBlock: KnockoutObservable<IStatBlock> = ko.observable(null);
        
        GetPreviewStatBlock = ko.computed(() => {
            return this.previewStatBlock() || StatBlock.Empty();
        })
        
        PreviewCreature = (creature: CreatureListing) => {
            if(creature.IsLoaded){
                this.previewStatBlock(creature.StatBlock());
            } else {
                this.previewStatBlock(null);
                creature.LoadStatBlock(listing => {
                    this.previewStatBlock(listing.StatBlock());
                });
            }
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
                if(c.Name.toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInName.push(c);
                    return;
                }
                if(c.Type.toLocaleLowerCase().indexOf(filter) > -1) {
                    creaturesWithFilterInType.push(c);
                }
            })
            return creaturesWithFilterInName.concat(creaturesWithFilterInType);
        });
    
        AddPlayers = (library: CreatureListing []) => {
            ko.utils.arrayPushAll(this.Players, library.map(c => {
                return new CreatureListing(c.Id, c.Name, c.Type);
            }));
        }
        
        AddCreatures = (library: CreatureListing []) =>  {
            library.sort((c1,c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll(this.Creatures, library.map(c => {
                return new CreatureListing(c.Id, c.Name, c.Type);
            }));
        }
	}
}