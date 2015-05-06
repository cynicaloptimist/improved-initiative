/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
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
    this.creatures.push(new Creature(creatureJson));
  }
  
  getCreatures(filter: (Creature) => boolean): Creature[]{
    if(typeof filter === 'function'){
      return this.creatures().filter(filter);
    }
    return this.creatures();
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
  CurrentHP: number;
  InitiativeModifier: number;
  StatBlock: StatBlock;
  Rules: Rules;
  constructor(creatureJson: StatBlock, rules?: Rules){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Rules = rules || new Rules();
    this.Name = creatureJson.Name;
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = creatureJson.HP.Value;
    this.InitiativeModifier = this.Rules.CalculateModifier(creatureJson.Attributes.Dex);
    this.StatBlock = creatureJson;
  }
}

class ViewModel{
  constructor(){
    var self = this;
    this.encounter = ko.observable<Encounter>(new Encounter());
    this.creatures = ko.observableArray<Creature>();
    this.AddCreature = function (data: StatBlock){
      self.encounter().addCreature(data);
    }
  }
  AddCreature: (StatBlock) => void;
  encounter: KnockoutObservable<Encounter>;
  creatures: KnockoutObservableArray<Creature>;
}

$(() => {
    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function(json){
    	viewModel.creatures(json);
    });
});