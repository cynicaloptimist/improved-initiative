module ImprovedInitiative {
	class CreatureListing {
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
        
        PreviewCreature = ko.observable<IStatBlock>(StatBlock.Empty());
    
        DisplayTab = ko.observable('Creatures');
        LibraryFilter = ko.observable('');
        
        FilteredCreatures = ko.computed<KnockoutObservable<IStatBlock> []>(() => {
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
            ko.utils.arrayPushAll(this.Players, library);
        }
        
        AddCreatures = (library: CreatureListing []) =>  {
            library.sort((c1,c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll(this.Creatures, library);
        }
	}
}