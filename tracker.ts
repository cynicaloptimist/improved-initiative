/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

class Encounter {
  constructor(){
    this.creatures = ko.observableArray<Creature>(); 
  }
  creatures: KnockoutObservableArray<Creature>;
  addCreature(creatureJson: StatBlock){
    console.log("adding %O", creatureJson);
    this.creatures.push(new Creature(creatureJson));
  }
  getCreatures(filter: (Creature) => boolean): Creature[]{
    if(typeof filter === 'function'){
      return this.creatures().filter(filter);
    }
    return this.creatures();
  };
};

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
  constructor(creatureJson: StatBlock){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Name = creatureJson.Name;
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = creatureJson.HP.Value;
  
    this.InitiativeModifier = this.CalculateModifier(creatureJson.Attributes.Dex);
  }
  
  CalculateModifier(attribute: number)
  {
    return Math.floor((attribute - 10) / 2)
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