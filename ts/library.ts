module ImprovedInitiative {
	export interface ICreatureLibrary {
		Creatures: KnockoutObservableArray<IHaveTrackerStats>;
    FilteredCreatures: KnockoutComputed<IHaveTrackerStats []>;
    Players: KnockoutObservableArray<IHaveTrackerStats>;
    SavedEncounterIndex: KnockoutObservableArray<string>;
    LibraryFilter: KnockoutObservable<string>;
    DisplayTab: KnockoutObservable<string>;
    AddCreatures: (json: IHaveTrackerStats []) => void;
    AddPlayers: (json: IHaveTrackerStats []) => void;
    PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
    EditStatBlock: (StatBlock: IStatBlock) => void;
	}
	
	export class CreatureLibrary implements ICreatureLibrary {
		constructor (private StatBlockEditor: IStatBlockEditor) {
			var savedEncounterList = localStorage.getItem('ImprovedInitiative.SavedEncounters');
      if(savedEncounterList && savedEncounterList != 'undefined'){
        JSON.parse(savedEncounterList).forEach(e => this.SavedEncounterIndex.push(e));
      }
		}
		Creatures = ko.observableArray<IHaveTrackerStats>([]);
    Players = ko.observableArray<IHaveTrackerStats>([]);
    SavedEncounterIndex = ko.observableArray<string>([]);
    
    
    PreviewCreature = ko.observable<IHaveTrackerStats>(null);
    AdjustPreviewPane = () => {
      var popPosition = $(event.target).position().top;
      var maxPopPosition = $(document).height() - $('.preview.statblock').height();
      if(popPosition > maxPopPosition){
        popPosition = maxPopPosition - 40;
      }
      $('.preview.statblock').css('top', popPosition).select();
    }
    HidePreviewPane = () => {
      if(!$('.preview.statblock').is(':hover'))
      {
        this.PreviewCreature(null);
      }
    }
    
    DisplayTab = ko.observable('Creatures');
    LibraryFilter = ko.observable('');
    
    FilteredCreatures = ko.computed(() => {
      if(this.DisplayTab() == 'Players'){
        return this.Players()
      }
      var filter = this.LibraryFilter().toLocaleLowerCase();
      if(filter.length == 0){
        return this.Creatures();
      }
      var creaturesWithFilterInName = [],
          creaturesWithFilterInType = [];
      
      this.Creatures().forEach(c => {
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
    
    EditStatBlock = (StatBlock: IStatBlock) => {
      this.StatBlockEditor.EditCreature(StatBlock, (newStatBlock: IStatBlock) => {
        
      });
      return false;
    }
    
    AddNewPlayer = () => {
      var player = StatBlock.Empty();
      player.Player = "player";
      this.AddPlayers([player]);
      this.EditStatBlock(player);
    }
    
    AddNewCreature = () => {
      var creature = StatBlock.Empty();
      this.AddCreatures(creature);
      this.EditStatBlock(creature);
    }
    
    AddPlayers = (library: IHaveTrackerStats []) => {
      this.Players(this.Players().concat(library));
    }
    
    AddCreatures(creatureOrLibrary: IHaveTrackerStats | IHaveTrackerStats []): void;
    AddCreatures(creatureOrLibrary: any): void {
      if(creatureOrLibrary.length)
      {
        this.Creatures(
          this.Creatures()
              .concat(creatureOrLibrary
                        .sort((a: IHaveTrackerStats, b: IHaveTrackerStats) => { 
                          return a.Name.toLocaleLowerCase() < b.Name.toLocaleLowerCase() ? -1 : 1;
                        })));
      } else {
        this.Creatures().push(creatureOrLibrary);
      }
    }
	}
}