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
      if(savedEncounterList == 'undefined'){
        savedEncounterList = '[]';
      }
      JSON.parse(savedEncounterList).forEach(e => {
        this.SavedEncounterIndex.push(e);
      });
		}
		Creatures = ko.observableArray<IHaveTrackerStats>([]);
    Players = ko.observableArray<IHaveTrackerStats>();
    SavedEncounterIndex = ko.observableArray<string>();
    
    ShowPreviewPane = (creature,event) => {
      this.PreviewCreature(creature);
        
      //todo: move this code into some sort of AfterRender within the preview statblock so it resizes first.
      var popPosition = $(event.target).position().top;
      var maxPopPosition = $(document).height() - parseInt($('.preview.statblock').css('max-height'));
      if(popPosition > maxPopPosition){
        popPosition = maxPopPosition - 10;
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
      var filter = this.LibraryFilter();
      if(filter.length == 0){
        return this.Creatures();
      }
      var creaturesWithFilterInName = this.Creatures().filter(v => {
        return v.Name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
      });
      var creaturesWithFilterInType = this.Creatures().filter(v => {
        return v.Type && v.Type.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
      });
      return creaturesWithFilterInName.concat(creaturesWithFilterInType);
    });
    
    PreviewCreature = ko.observable<IHaveTrackerStats>();
    PreviewCreatureStatblock = ko.computed(() => {
      return this.PreviewCreature() || StatBlock.Empty();
    });
    
    StatblockEditor: StatblockEditor;
    
    EditStatBlock = (StatBlock: IStatBlock) => {
      this.StatblockEditor.EditCreature(StatBlock, (newStatBlock: IStatBlock) => {
        if(StatBlock.Player == "player"){
          this.Players.splice(this.Players.indexOf(StatBlock),1,newStatBlock)
        }
      });
      return false;
    }
    
    AddNewPlayer = () => {
      var player = StatBlock.Empty();
      this.EditStatBlock(player);
    }
    
    AddNewCreature = () => {
      var creature = StatBlock.Empty();
      this.EditStatBlock(creature);
    }
    
    AddPlayers(library: IHaveTrackerStats []): void {
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