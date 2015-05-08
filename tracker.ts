/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />

interface IHaveValue{
  Value: number;
}

interface IHaveAttributes{
  Str: number;
  Dex: number;
  Con: number;
  Cha: number;
  Int: number;
  Wis: number;
}

interface IHaveTrackerStats{
  Name: string;
  HP: IHaveValue;
  Attributes: IHaveAttributes;
}

class StatBlock {
  static Empty = { Name: 'None', HP: { Value: 0 }, Attributes: { Str: 0, Dex: 0, Con: 0, Cha: 0, Int: 0, Wis: 0} }
}

interface Rules{
  CalculateModifier: (attribute:number) => number;
  Check: (mods : number[]) => number;
  GroupSimilarCreatures: boolean;
}

class DefaultRules implements Rules {
  CalculateModifier = (attribute: number) =>
  {
    return Math.floor((attribute - 10) / 2);
  }
  Check = (mods: number[]) => 
  {
    return Math.ceil(Math.random() * 20) + mods.reduce((p,c) => p + c);
  }
  GroupSimilarCreatures = false;
}

class Encounter {
  constructor(rules?: Rules){
    this.creatures = ko.observableArray<Creature>();
    this.SelectedCreature = ko.observable<Creature>();
    this.Rules = rules || new DefaultRules();
    this.SelectedCreatureStatblock = ko.computed(() => 
    {
      return this.SelectedCreature() 
                 ? this.SelectedCreature().StatBlock 
                 : StatBlock.Empty;
    })
  }
  
  creatures: KnockoutObservableArray<Creature>;
  SelectedCreature: KnockoutObservable<Creature>;
  SelectedCreatureStatblock: KnockoutComputed<IHaveTrackerStats>;
  Rules: Rules;
  
  private sortByInitiative = () => {
    this.creatures.sort((l,r) => (r.Initiative() - l.Initiative()) || 
                                 (r.InitiativeModifier - l.InitiativeModifier));
  }
  
  private moveCreature = (creature: Creature, index: number) => 
  {
    this.creatures.remove(creature);
    this.creatures.splice(index,0,creature);
  }
  
  private relativeNavigateFocus = (offset: number) => 
  {
    var newIndex = this.creatures.indexOf(this.SelectedCreature()) + offset;
    if(newIndex < 0){ 
      newIndex = 0;
    } else if(newIndex >= this.creatures().length) { 
      newIndex = this.creatures().length - 1; 
    }
    this.SelectedCreature(this.creatures()[newIndex]);
  }
  
  AddCreature = (creatureJson: IHaveTrackerStats) => 
  {
    console.log("adding %O", creatureJson);
    this.creatures.push(new Creature(creatureJson, this));
  }
  
  SelectPreviousCombatant = () =>
  {
    this.relativeNavigateFocus(-1);
  }
  
  SelectNextCombatant = () =>
  {
    this.relativeNavigateFocus(1);
  }
  
  FocusSelectedCreatureHP = () =>
  {
    if(this.SelectedCreature()){
      this.SelectedCreature().FocusHP(true);
    }
    return false;
  }
  
  MoveSelectedCreatureUp = () =>
  {
    var creature = this.SelectedCreature();
    var index = this.creatures.indexOf(creature)
    if(creature && index > 0){
      this.moveCreature(creature, index - 1);
    }
  }
  
  MoveSelectedCreatureDown = () =>
  {
    var creature = this.SelectedCreature();
    var index = this.creatures.indexOf(creature)
    if(creature && index < this.creatures().length - 1){
      this.moveCreature(creature, index + 1);
    }
  }
  
  RollInitiative = () =>
  {
    if(this.Rules.GroupSimilarCreatures)
    {
      var initiatives = []
      this.creatures().forEach(
        c => {
          if(initiatives[c.Name] === undefined){
            initiatives[c.Name] = c.RollInitiative();
          }
          c.Initiative(initiatives[c.Name]);
        }
      )
    } else {
      this.creatures().forEach(c => { c.RollInitiative(); })
    }
    
    this.sortByInitiative();
  }
}

class Creature{
  Name: string;
  Alias: KnockoutObservable<string>;
  MaxHP: number;
  CurrentHP: KnockoutObservable<number>;
  HPChange: KnockoutObservable<number>;
  InitiativeModifier: number;
  Initiative: KnockoutObservable<number>;
  StatBlock: IHaveTrackerStats;
  Encounter: Encounter;
  FocusHP: KnockoutObservable<boolean>;
  constructor(creatureJson: IHaveTrackerStats, encounter: Encounter, rules?: Rules){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Encounter = encounter;
    this.Name = creatureJson.Name;
    this.Alias = this.setAlias(this.Name);
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = ko.observable(creatureJson.HP.Value);
    this.HPChange = ko.observable(null);
    this.InitiativeModifier = this.Encounter.Rules.CalculateModifier(creatureJson.Attributes.Dex);
    this.Initiative = ko.observable(0);
    this.StatBlock = creatureJson;
    this.FocusHP = ko.observable(false);
  }
  
  private setAlias = (name: string) => {
    var others = this.Encounter.creatures().filter(c => c !== this && c.Name === name);
    if(others.length === 1){
      others[0].Alias(name + " 1")
    }
    
    return ko.observable(name + " " + (others.length + 1));
  }
  
  CommitHP = () => {
    this.CurrentHP(this.CurrentHP() - this.HPChange());
    this.HPChange(null);
    this.FocusHP(false);
  }
  GetHPColor = () => {
    var green = Math.floor((this.CurrentHP() / this.MaxHP) * 220);
    var red = Math.floor((this.MaxHP - this.CurrentHP()) / this.MaxHP * 255);
    return "rgb(" + red + "," + green + ",0)";
  }
  RollInitiative = () => {
    var roll = this.Encounter.Rules.Check([this.InitiativeModifier]);
    this.Initiative(roll);
    return roll;
  }
  AbilityCheck = (attribute: string, mods: number[]) => {
    var abilityScore = this.StatBlock.Attributes[attribute];
    if(abilityScore === undefined){
      throw "attribute " + attribute + " not on creatures " + this.Alias();
    }
    mods.push(this.Encounter.Rules.CalculateModifier(abilityScore));
    return this.Encounter.Rules.Check(mods);
  }
}

class ViewModel{
  constructor(){
    var self = this;
    this.encounter = ko.observable<Encounter>(new Encounter());
    this.creatures = ko.observableArray<IHaveTrackerStats>();
  }
  encounter: KnockoutObservable<Encounter>;
  creatures: KnockoutObservableArray<IHaveTrackerStats>;
}

function RegisterKeybindings(viewModel: ViewModel){
  Mousetrap.bind('j',viewModel.encounter().SelectNextCombatant);
  Mousetrap.bind('k',viewModel.encounter().SelectPreviousCombatant);
  Mousetrap.bind('t',viewModel.encounter().FocusSelectedCreatureHP);
  Mousetrap.bind('alt+r',viewModel.encounter().RollInitiative);
  Mousetrap.bind('alt+j',viewModel.encounter().MoveSelectedCreatureDown);
  Mousetrap.bind('alt+k',viewModel.encounter().MoveSelectedCreatureUp);
}

$(() => {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function(json){
    	viewModel.creatures(json);
      viewModel.creatures().forEach(viewModel.encounter().AddCreature);
      viewModel.creatures().forEach(viewModel.encounter().AddCreature);
      viewModel.creatures().forEach(viewModel.encounter().AddCreature);
    });
});