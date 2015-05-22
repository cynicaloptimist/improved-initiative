module ImprovedInitiative {
	export interface ICreatureLibrary {
		Creatures: KnockoutObservableArray<IHaveTrackerStats>;
    FilteredCreatures: KnockoutComputed<IHaveTrackerStats []>;
    LibraryFilter: KnockoutObservable<string>;
    Add: (json: IHaveTrackerStats []) => void;
    PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
	}
	
	export class CreatureLibrary implements ICreatureLibrary {
		constructor (creatures?: IHaveTrackerStats []) {
			this.Creatures(creatures || []);
		}
		Creatures = ko.observableArray<IHaveTrackerStats>();
    LibraryFilter = ko.observable('');
    FilteredCreatures = ko.computed(() => {
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
    
    PreviewCreature = ko.observable<IHaveTrackerStats>()
    PreviewCreatureStatblock = ko.computed(() => {
      return this.PreviewCreature() || StatBlock.Empty();
    });
    
    Add(creatureOrLibrary: IHaveTrackerStats | IHaveTrackerStats []): void;
    Add(creatureOrLibrary: any): void {
      if(creatureOrLibrary.length)
      {
        this.Creatures(this.Creatures().concat(creatureOrLibrary));
      } else {
        this.Creatures().push(creatureOrLibrary);
      }
    }
	}
}