module ImprovedInitiative {
	export interface ICreature{
    Encounter: Encounter;
	  Name: string;
	  Alias: KnockoutObservable<string>;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
	  HPChange: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
	  Tags: KnockoutObservableArray<string>;
    NewTag: KnockoutObservable<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: IStatBlock;
	  EditingHP: KnockoutObservable<boolean>;
	  EditingName: KnockoutObservable<boolean>;
    AddingTag: KnockoutObservable<boolean>;
    
    RollInitiative: () => void;
  }
	
  export class Creature implements ICreature{
	  constructor(creatureJson: IHaveTrackerStats, public Encounter: Encounter){
	    this.StatBlock = StatBlock.Empty();
      jQuery.extend(this.StatBlock, creatureJson);
	    this.Name = this.StatBlock.Name;
      this.Alias = this.setAlias(this.Name)
      this.MaxHP = this.StatBlock.HP.Value;
      this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
      this.HPChange = ko.observable(null);
      this.AbilityModifiers = this.calculateModifiers();
      this.AC = this.StatBlock.AC.Value;
      this.Tags = ko.observableArray<string>();
      this.NewTag = ko.observable<string>();
      this.InitiativeModifier = this.StatBlock.InitiativeModifier || this.Encounter.Rules.Modifier(this.StatBlock.Abilities.Dex);
      this.Initiative = ko.observable(0);
      this.EditingHP = ko.observable(false);
      this.EditingName = ko.observable(false);
      this.AddingTag = ko.observable(false);
	  }
    
    Name: string;
	  Alias: KnockoutObservable<string>;
	  MaxHP: number;
	  CurrentHP: KnockoutObservable<number>;
	  HPChange: KnockoutObservable<number>;
	  AC: number;
	  AbilityModifiers: IHaveAbilities;
    Tags: KnockoutObservableArray<string>;
    NewTag: KnockoutObservable<string>;
	  InitiativeModifier: number;
	  Initiative: KnockoutObservable<number>;
	  StatBlock: IStatBlock;
	  EditingHP: KnockoutObservable<boolean>;
	  EditingName: KnockoutObservable<boolean>;
    AddingTag: KnockoutObservable<boolean>;
	  
    private setAlias = (name: string) => {
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
    
    CommitHP = () => {
	    this.CurrentHP(this.CurrentHP() - this.HPChange());
	    this.HPChange(null);
	    this.EditingHP(false);
	  }
	  
	  CommitName = () => {
	    this.EditingName(false);
	  }
    
    CommitTag = () => {
      this.Tags.push(this.NewTag());
      this.NewTag(null);
	    this.AddingTag(false);
	  }
    
    RemoveTag = (tag: string) => {
      this.Tags.splice(this.Tags.indexOf(tag), 1);
    }
    
    GetHPColor = () => {
	    var green = Math.floor((this.CurrentHP() / this.MaxHP) * 170);
	    var red = Math.floor((this.MaxHP - this.CurrentHP()) / this.MaxHP * 170);
	    return "rgb(" + red + "," + green + ",0)";
	  }
	  
	  RollInitiative = () => {
	    var roll = this.Encounter.Rules.Check(this.InitiativeModifier);
	    this.Initiative(roll);
	    return roll;
	  }
	}
}