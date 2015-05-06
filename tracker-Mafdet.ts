/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />

class Rules {
  CalculateModifier(attribute: number)
  {
    return Math.floor((attribute - 10) / 2);
  }
  AbilityCheck(mods: number[])
  {
    return Math.ceil(Math.random() * 20) + mods.reduce((p,c) => p + c);
  }
}

class Encounter {
  constructor(){
    this.creatures = ko.observableArray<Creature>(); 
    this.selectedCreature = ko.observable<Creature>();
  }
  
  creatures: KnockoutObservableArray<Creature>;
  selectedCreature: KnockoutObservable<Creature>;
  
  addCreature(creatureJson: StatBlock){
    console.log("adding %O", creatureJson);
    this.creatures.push(new Creature(creatureJson, this));
  }
  
  relativeNavigateFocus(offset: number){
    var newIndex = this.creatures.indexOf(this.selectedCreature()) + offset;
    if(newIndex < 0){ 
      newIndex = 0;
    } else if(newIndex >= this.creatures().length) { 
      newIndex = this.creatures().length - 1; 
    }
    this.selectedCreature(this.creatures()[newIndex]);
  }
  
  selectPreviousCombatant(){
    this.relativeNavigateFocus(-1);
  }
  
  selectNextCombatant(){
    this.relativeNavigateFocus(1);
  }
  
  focusSelectedCreatureHP(){
    if(this.selectedCreature()){
      this.selectedCreature().FocusHP(true);
    }
    return false;
  }
}

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

interface StatBlock{
  Name: string;
  HP: IHaveValue;
  Attributes: IHaveAttributes;
}

class Creature{
  Name: string;
  MaxHP: number;
  CurrentHP: KnockoutObservable<number>;
  HPChange: KnockoutObservable<number>;
  InitiativeModifier: number;
  StatBlock: StatBlock;
  Encounter: Encounter;
  Rules: Rules;
  FocusHP: KnockoutObservable<boolean>;
  constructor(creatureJson: StatBlock, encounter: Encounter, rules?: Rules){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Encounter = encounter;
    this.Rules = rules || new Rules();
    this.Name = creatureJson.Name;
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = ko.observable(creatureJson.HP.Value);
    this.HPChange = ko.observable(null);
    this.InitiativeModifier = this.Rules.CalculateModifier(creatureJson.Attributes.Dex);
    this.StatBlock = creatureJson;
    this.FocusHP = ko.observable(false);
  }
  CommitHP(){
    this.CurrentHP(this.CurrentHP() - this.HPChange());
    this.HPChange(null);
    this.FocusHP(false);
  }
  GetHPColor(){
    var green = Math.floor((this.CurrentHP() / this.MaxHP) * 220);
    var red = Math.floor((this.MaxHP - this.CurrentHP()) / this.MaxHP * 255);
    return "rgb(" + red + "," + green + ",0)";
  }
}

class ViewModel{
  constructor(){
    var self = this;
    this.encounter = ko.observable<Encounter>(new Encounter());
    this.creatures = ko.observableArray<Creature>();
  }
  encounter: KnockoutObservable<Encounter>;
  creatures: KnockoutObservableArray<Creature>;
}

function RegisterKeybindings(viewModel: ViewModel){
  Mousetrap.bind('j',viewModel.encounter().selectNextCombatant.bind(viewModel.encounter()));
  Mousetrap.bind('k',viewModel.encounter().selectPreviousCombatant.bind(viewModel.encounter()));
  Mousetrap.bind('t',viewModel.encounter().focusSelectedCreatureHP.bind(viewModel.encounter()));
}

$(() => {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function(json){
    	viewModel.creatures(json);
    });
});