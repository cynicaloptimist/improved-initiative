module ImprovedInitiative {
	export interface ICreature{
    Encounter: Encounter;
	  Alias: KnockoutObservable<string>;
    SetNumberedAlias: (name: string) => void;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
	  Tags: KnockoutObservableArray<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: KnockoutObservable<IStatBlock>;
    RollInitiative: () => void;
    ViewModel: CombatantViewModel;
  }
	
  export class Creature implements ICreature{
	  constructor(creatureJson: IHaveTrackerStats, public Encounter: Encounter){
	    var statBlock = StatBlock.Empty();
      jQuery.extend(statBlock, creatureJson);
      this.StatBlock = ko.observable(statBlock);
      this.Alias(statBlock.Name);
	    this.SetNumberedAlias(statBlock.Name);
      this.MaxHP = statBlock.HP.Value;
      this.CurrentHP = ko.observable(statBlock.HP.Value);
      this.TemporaryHP = ko.observable(0);
      this.AbilityModifiers = this.calculateModifiers();
      this.AC = statBlock.AC.Value;
      this.Tags = ko.observableArray<string>();
      this.InitiativeModifier = statBlock.InitiativeModifier || this.Encounter.Rules.Modifier(statBlock.Abilities.Dex);
      this.Initiative = ko.observable(0);
	  }
    
    Alias = ko.observable('');
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
    Tags: KnockoutObservableArray<string>;
    NewTag: KnockoutObservable<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: KnockoutObservable<IStatBlock>;
    ViewModel: any;
	  
    SetNumberedAlias = (name: string) => {
	    var others = this.Encounter.Creatures().filter(c => c !== this && c.StatBlock().Name === name);
      if(others.length === 0){
	      this.Alias(name);
        return;
	    }
	    if(others.length === 1){
	      others[0].Alias(name + " 1")
	    }
      this.Alias(name + " " + (others.length + 1));
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
	}
}