declare var ko: any;

interface JQuery {
    fadeIn(): JQuery;
    fadeOut(): JQuery;
    focus(): JQuery;
    html(): string;
    html(val: string): JQuery;
    show(): JQuery;
    addClass(className: string): JQuery;
    removeClass(className: string): JQuery;
    append(el: HTMLElement): JQuery;
    val(): string;
    val(value: string): JQuery;
    attr(attrName: string): string;
}

declare var $: {
    (el: HTMLElement): JQuery;
    (selector: string): JQuery;
    (readyCallback: () => void ): JQuery;
    (getJson: () => any): function;
};

declare var _: {
    each<T, U>(arr: T[], f: (elem: T) => U): U[];
    delay(f: Function, wait: number, ...arguments: any[]): number;
    template(template: string): (model: any) => string;
    bindAll(object: any, ...methodNames: string[]): void;
};

var loadCreatures = function(containers, creatures){
	if(creatures.length){
		creatures.forEach(function(creature, index){
			containers.append("<p creature-index='" + index + "'>" + creature.Name + "</p>");
		});
	}
}

var addCreature = function(){
	var creature = creatures[$(this).attr('creature-index')];
	encounter.addCreature(creature);
}

var initialize = function() {
	$.getJSON('creatures.json', function(json){
    	creatures = json;
    	loadCreatures($('.creatures'), creatures);
    	$('.creatures p').click(addCreature);
    });
}

class Encounter {
  creatures: Creature[]
  addCreature = function(creatureJson){
    console.log("adding %O", creatureJson);
    var encounterIndex = this.creatures.push(creatureJson) - 1;
    var creature = new Creature(creatureJson);
    newElement.data(creature)
  }
  getCreatures = function(filter){
    if(typeof filter === 'function'){
      return this.creatures.filter(filter);
    }
    return this.creatures;
  };
};


class Creature{
  Name: string;
  MaxHP: number;
  CurrentHP: number;
  InitiativeModifier: number;
  
  constructor(creatureJson){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Name = creatureJson.Name;
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = creatureJson.HP.Value;
  
    this.InitiativeModifier = this.CalculateModifier(creatureJson.Attributes.Dex);
  }
  
  CalculateModifier = function(attribute)
  {
    return Math.floor((attribute - 10) / 2)
  }
}

var encounter = new Encounter();

var viewModel = {
                  encounter: ko.observable(encounter)
                };



$(() => {
    ko.applyBindings(viewModel);
});