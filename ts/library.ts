module ImprovedInitiative {
	export interface ICreatureLibrary {
		Creatures: KnockoutObservableArray<IHaveTrackerStats>;
    FilteredCreatures: KnockoutComputed<IHaveTrackerStats []>;
    Players: KnockoutObservableArray<IHaveTrackerStats>;
    LibraryFilter: KnockoutObservable<string>;
    DisplayTab: KnockoutObservable<string>;
    AddCreatures: (json: IHaveTrackerStats []) => void;
    AddPlayers: (json: IHaveTrackerStats []) => void;
    PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
	}
	
	export class CreatureLibrary implements ICreatureLibrary {
		constructor (creatures?: IHaveTrackerStats []) {
			this.Creatures(creatures || []);
		}
		Creatures = ko.observableArray<IHaveTrackerStats>();
    Players = ko.observableArray<IHaveTrackerStats>();
    
    ShowPreviewPane = (creature,event) => {
      this.PreviewCreature(creature);
        
      //todo: move this code into some sort of AfterRender within the preview statblock so it resizes first.
      var popPosition = $(event.target).position().top;
      var maxPopPosition = $(document).height() - parseInt($('.preview.statblock').css('max-height'));
      if(popPosition > maxPopPosition){
        popPosition = maxPopPosition - 10;
      }
      $('.preview.statblock').css('top', popPosition);
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
    
    EditCreature = ko.observable<IHaveTrackerStats>();
    EditCreatureStatblock = ko.computed(() => {
      return this.EditCreature() || StatBlock.Empty();
    })
    
    SaveCreature = () => {
      var creature = this.EditCreature();
      if(this.DisplayTab() == 'Creatures')
      {
        this.Creatures.splice(this.Creatures.indexOf(creature), 1, creature);
      } 
      else if (this.DisplayTab() == 'Players')
      {
        creature.Player = 'player'
        this.Players.splice(this.Players.indexOf(creature), 1, creature);
      }
      this.EditCreature(null);
    }
    
    AddNewPlayer = () => {
      var player = StatBlock.Empty();
      this.EditCreature(player);
    }
    
    AddNewCreature = () => {
      var creature = StatBlock.Empty();
      this.EditCreature(creature);
    }
    
    AddPlayers(library: IHaveTrackerStats []): void {
      this.Players(this.Players().concat(library));
    }
    
    AddCreatures(creatureOrLibrary: IHaveTrackerStats | IHaveTrackerStats []): void;
    AddCreatures(creatureOrLibrary: any): void {
      if(creatureOrLibrary.length)
      {
        this.Creatures(this.Creatures().concat(creatureOrLibrary));
      } else {
        this.Creatures().push(creatureOrLibrary);
      }
    }
	}
}