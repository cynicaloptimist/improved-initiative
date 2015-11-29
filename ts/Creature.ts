module ImprovedInitiative {
	export interface ICreature{
    Encounter: Encounter;
	  Alias: KnockoutObservable<string>;
    IndexLabel: number;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
	  Tags: KnockoutObservableArray<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
    Hidden: KnockoutObservable<boolean>;
	  StatBlock: KnockoutObservable<IStatBlock>;
    RollInitiative: () => void;
    ViewModel: CombatantViewModel;
    IsPlayerCharacter: boolean;
  }
	
  export class Creature implements ICreature{
	  constructor(creatureJson: IStatBlock, public Encounter: Encounter){
	    var statBlock = StatBlock.Empty();
      jQuery.extend(statBlock, creatureJson);
      this.StatBlock = ko.observable(statBlock);
      this.setIndexLabel();
      this.MaxHP = statBlock.HP.Value;
      this.CurrentHP = ko.observable(statBlock.HP.Value);
      this.TemporaryHP = ko.observable(0);
      this.AbilityModifiers = this.calculateModifiers();
      this.AC = statBlock.AC.Value;
      this.Tags = ko.observableArray<string>();
      this.InitiativeModifier = statBlock.InitiativeModifier || this.Encounter.Rules.Modifier(statBlock.Abilities.Dex);
      this.Initiative = ko.observable(0);
	  }
    
    IndexLabel: number;
    Alias = ko.observable(null);
    MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
    PlayerDisplayHP: KnockoutComputed<string>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
    Tags: KnockoutObservableArray<string>;
    NewTag: KnockoutObservable<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
    Hidden = ko.observable(false);
    StatBlock: KnockoutObservable<IStatBlock>;
    ViewModel: any;
    IsPlayerCharacter = false;
    
    private setIndexLabel() {
      var name = this.StatBlock().Name,
          counts = this.Encounter.CreatureCountsByName;
      if(!counts[name]){
        counts[name] = ko.observable(1);
      } else {
        counts[name](counts[name]() + 1);
      }
      this.IndexLabel = counts[name]();
    }
	  
	  private calculateModifiers = () => {
	    var modifiers = StatBlock.Empty().Abilities;
	    for(var attribute in this.StatBlock().Abilities){
	      modifiers[attribute] = this.Encounter.Rules.Modifier(this.StatBlock().Abilities[attribute]);
	    }
	    return modifiers;
	  }
    
    RollInitiative = () => {
	    var roll = this.Encounter.Rules.Check(this.InitiativeModifier);
	    this.Initiative(roll);
	    return roll;
	  }
    
    HandleClick = (data: ICreature, e: MouseEvent) => {
      var selectedCreatures = this.Encounter.SelectedCreatures;
      if(!e.ctrlKey){
        selectedCreatures.removeAll();
      }
      selectedCreatures.push(data);
    }
    
	}
}