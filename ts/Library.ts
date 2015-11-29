module ImprovedInitiative {
	export interface ICreatureLibrary {
		Creatures: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        Players: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        FilteredCreatures: KnockoutComputed<KnockoutObservable<IHaveTrackerStats> []>;
        SavedEncounterIndex: KnockoutObservableArray<string>;
        LibraryFilter: KnockoutObservable<string>;
        DisplayTab: KnockoutObservable<string>;
        AddCreatures: (json: IHaveTrackerStats []) => void;
        AddPlayers: (json: IHaveTrackerStats []) => void;
        PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
        EditStatBlock: (StatBlock: IStatBlock, event?) => void;
	}
	
	export class CreatureLibrary implements ICreatureLibrary {
		constructor (private StatBlockEditor: IStatBlockEditor) {
			var savedEncounterList = localStorage.getItem('ImprovedInitiative.SavedEncounters');
      if(savedEncounterList && savedEncounterList != 'undefined'){
        JSON.parse(savedEncounterList).forEach(e => this.SavedEncounterIndex.push(e));
      }
		}
		Creatures = ko.observableArray<KnockoutObservable<IHaveTrackerStats>>([]);
    Players = ko.observableArray<KnockoutObservable<IHaveTrackerStats>>([]);
    SavedEncounterIndex = ko.observableArray<string>([]);
    
    PreviewCreature = ko.observable<IHaveTrackerStats>(StatBlock.Empty());
    PreviewEncounter = ko.observable<ISavedEncounter<ISavedCreature>>({Creatures: [], ActiveCreatureIndex: -1, Name: ''});
   
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
        if(c().Name.toLocaleLowerCase().indexOf(filter) > -1) {
          creaturesWithFilterInName.push(c);
          return;
        }
        if(c().Type.toLocaleLowerCase().indexOf(filter) > -1) {
          creaturesWithFilterInType.push(c);
        }
      })
      return creaturesWithFilterInName.concat(creaturesWithFilterInType);
    });
    
    EditStatBlock = (StatBlock: IStatBlock, event?) => {
      var StatBlockObservable = this.Creatures().filter(c => c() === StatBlock)[0];
      this.StatBlockEditor.EditCreature(StatBlock, (newStatBlock: IStatBlock) => {
        StatBlockObservable(newStatBlock);
      });
      return false;
    }
    
    AddNewPlayer = () => {
      var player = StatBlock.Empty(s => {s.Player = "player"});
      player.Player = "player";
      this.EditStatBlock(this.AddCreature(player)());
    }
    
    AddNewCreature = () => {
      var creature = StatBlock.Empty();
      this.EditStatBlock(this.AddCreature(creature)());
    }
    
    AddPlayers = (library: IHaveTrackerStats []) => {
      library.forEach(c => this.Players.push(ko.observable(c)));
    }
    AddPlayer(player: IStatBlock): KnockoutObservable<IStatBlock> {
      var observablePlayer = ko.observable(player);
      this.Players.push(observablePlayer);
      return observablePlayer;
    }
    
    AddCreatures = (library: IHaveTrackerStats []) =>  {
      library.sort((c1,c2) => {
        return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
      }).forEach(c => this.Creatures.push(ko.observable(c)));
    }
    AddCreature(creature: IStatBlock): KnockoutObservable<IStatBlock> {
      var observableCreature = ko.observable(creature);
      this.Creatures.push(observableCreature);
      return observableCreature;
    }
	}
}