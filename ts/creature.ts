module ImprovedInitiative {
	export interface ICreature{
    Encounter: Encounter;
	  Name: string;
	  Alias: KnockoutObservable<string>;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
	  Tags: KnockoutObservableArray<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: IStatBlock;
    RollInitiative: () => void;
    
  }
	
  export class Creature {
	  constructor(creatureJson: IHaveTrackerStats, public Encounter: Encounter){
	    this.StatBlock = StatBlock.Empty();
      jQuery.extend(this.StatBlock, creatureJson);
	    this.Name = this.StatBlock.Name;
      this.Alias = this.SetAlias(this.Name)
      this.MaxHP = this.StatBlock.HP.Value;
      this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
      this.TemporaryHP = ko.observable(0);
      this.AbilityModifiers = this.calculateModifiers();
      this.AC = this.StatBlock.AC.Value;
      this.Tags = ko.observableArray<string>();
      this.InitiativeModifier = this.StatBlock.InitiativeModifier || this.Encounter.Rules.Modifier(this.StatBlock.Abilities.Dex);
      this.Initiative = ko.observable(0);
	  }
    
    Name: string;
	  Alias: KnockoutObservable<string>;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
    TemporaryHP: KnockoutObservable<number>;
	  HPChange: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
    Tags: KnockoutObservableArray<string>;
    NewTag: KnockoutObservable<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: IStatBlock;
	  
    SetAlias = (name: string) => {
	    var others = this.Encounter.Creatures().filter(c => c !== this && c.Name === name);
	    if(others.length === 0){
	      return ko.observable(name);
	    }
	    if(others.length === 1){
	      others[0].Alias(name + " 1")
	    }
	    return ko.observable(name + " " + (others.length + 1));
	  }
	  
	  private calculateModifiers = () => {
	    var modifiers = StatBlock.Empty().Abilities;
	    for(var attribute in this.StatBlock.Abilities){
	      modifiers[attribute] = this.Encounter.Rules.Modifier(this.StatBlock.Abilities[attribute]);
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