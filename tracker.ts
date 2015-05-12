/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout/bindinghandlers.d.ts" />
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

interface IHaveAModifier{
  Name: string;
  Value: number;
}

interface IHaveTrackerStats{
  Name: string;
  HP: IHaveValue;
  AC: IHaveValue;
  Attributes: IHaveAttributes;
  Saves: IHaveAModifier[];
}

class StatBlock {
  static Empty = () => ({ 
    Name: '', Type: '', 
    HP: { Value: 1, Notes: ''},  AC: { Value: 10, Notes: ''},
    Speed: [],
    Attributes: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
    DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
    Saves: [], Skills: [], Senses: [], Languages: [],
    Challenge: 0,
    Traits: [],
    Actions: [],
    LegendaryActions: []
  })
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
    this.Rules = rules || new DefaultRules();
    this.creatures = ko.observableArray<Creature>();
    this.SelectedCreature = ko.observable<Creature>();
    this.SelectedCreatureStatblock = ko.computed(() => 
    {
      return this.SelectedCreature() 
                 ? this.SelectedCreature().StatBlock
                 : StatBlock.Empty();
    });
    this.ActiveCreature = ko.observable<Creature>();
    this.ActiveCreatureStatblock = ko.computed(() => 
    {
      return this.ActiveCreature() 
                 ? this.ActiveCreature().StatBlock
                 : StatBlock.Empty();
    });
  }
  
  Rules: Rules;
  creatures: KnockoutObservableArray<Creature>;
  SelectedCreature: KnockoutObservable<Creature>;
  SelectedCreatureStatblock: KnockoutComputed<IHaveTrackerStats>;
  ActiveCreature: KnockoutObservable<Creature>;
  ActiveCreatureStatblock: KnockoutComputed<IHaveTrackerStats>;
  
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
  
  RemoveSelectedCreature = () => {
    this.creatures.remove(this.SelectedCreature());
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
  
  EditSelectedCreatureName = () => 
  {
    if(this.SelectedCreature()){
      this.SelectedCreature().EditName(true);
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
    this.ActiveCreature(this.creatures()[0]);
  }
  
  NextTurn = () => {
    var nextIndex = this.creatures().indexOf(this.ActiveCreature()) + 1;
    if(nextIndex >= this.creatures().length){
      nextIndex = 0;
    }
    this.ActiveCreature(this.creatures()[nextIndex]);
  }
}

class Creature{
  Name: string;
  Alias: KnockoutObservable<string>;
  MaxHP: number;
  CurrentHP: KnockoutObservable<number>;
  HPChange: KnockoutObservable<number>;
  AC: number;
  AbilityModifiers: IHaveAttributes;
  Saves: IHaveAttributes;
  InitiativeModifier: number;
  Initiative: KnockoutObservable<number>;
  StatBlock: IHaveTrackerStats;
  Encounter: Encounter;
  FocusHP: KnockoutObservable<boolean>;
  EditName: KnockoutObservable<boolean>;
  constructor(creatureJson: IHaveTrackerStats, encounter: Encounter, rules?: Rules){
    this.StatBlock = StatBlock.Empty();
    jQuery.extend(this.StatBlock, creatureJson);
    this.Encounter = encounter;
    this.Name = this.StatBlock.Name;
    this.Alias = this.setAlias(this.Name);
    this.MaxHP = this.StatBlock.HP.Value;
    this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
    this.HPChange = ko.observable(null);
    this.AbilityModifiers = this.calculateModifiers();
    this.AC = this.StatBlock.AC.Value;
    this.Saves = this.calculateSaves();
    this.InitiativeModifier = this.Encounter.Rules.CalculateModifier(this.StatBlock.Attributes.Dex);
    this.Initiative = ko.observable(0);
    this.FocusHP = ko.observable(false);
    this.EditName = ko.observable(false);
  }
  
  private setAlias = (name: string) => {
    var others = this.Encounter.creatures().filter(c => c !== this && c.Name === name);
    if(others.length === 0){
      return ko.observable(name);
    }
    if(others.length === 1){
      others[0].Alias(name + " 1")
    }
    return ko.observable(name + " " + (others.length + 1));
  }
  
  private calculateModifiers = () => {
    var modifiers = StatBlock.Empty().Attributes;
    for(var attribute in this.StatBlock.Attributes){
      modifiers[attribute] = this.Encounter.Rules.CalculateModifier(this.StatBlock.Attributes[attribute]);
    }
    return modifiers;
  }
  
  private calculateSaves = () => {
    var saves = this.AbilityModifiers;
    for(var save of this.StatBlock.Saves){
      saves[save.Name] = save.Value;
    }
    return saves;
  }

  CommitHP = () => {
    this.CurrentHP(this.CurrentHP() - this.HPChange());
    this.HPChange(null);
    this.FocusHP(false);
  }
  
  CommitName = () => {
    this.EditName(false);
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
    this.encounter = ko.observable<Encounter>(new Encounter());
    this.creatures = ko.observableArray<IHaveTrackerStats>();
    this.LibraryFilter = ko.observable('');
    this.FilteredCreatures = ko.computed(() => {
      var filter = this.LibraryFilter();
      if(filter.length == 0){
        return this.creatures();
      }
      return this.creatures().filter(v => {
        return v.Name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
      });
    })
  }
  encounter: KnockoutObservable<Encounter>;
  creatures: KnockoutObservableArray<IHaveTrackerStats>;
  FilteredCreatures: KnockoutComputed<IHaveTrackerStats []>
  LibraryFilter: KnockoutObservable<string>;
}

function RegisterKeybindings(viewModel: ViewModel){
  Mousetrap.bind('j',viewModel.encounter().SelectNextCombatant);
  Mousetrap.bind('k',viewModel.encounter().SelectPreviousCombatant);
  Mousetrap.bind('n',viewModel.encounter().NextTurn);
  Mousetrap.bind('t',viewModel.encounter().FocusSelectedCreatureHP);
  Mousetrap.bind('del',viewModel.encounter().RemoveSelectedCreature);
  Mousetrap.bind('f2', viewModel.encounter().EditSelectedCreatureName);
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
    });
});