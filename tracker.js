var Encounter = function(){
  this.creatures = [];
  return this;
};

Encounter.prototype.addCreature = function(creatureJson){
  console.log("adding %O", creatureJson);
  var encounterIndex = this.creatures.push(creatureJson) - 1;
  var creature = new Creature(creatureJson);
  newElement.data(creature);
};

Encounter.prototype.getCreatures = function(filter){
  if(typeof filter === 'function'){
    return this.creatures.filter(filter);
  }
  return this.creatures;
};

var Creature = function(creatureJson){
  if(!creatureJson){
    throw "Couldn't create Creature- no Json passed in.";
  }
  this.Name = creatureJson.Name;
  this.MaxHP = creatureJson.HP.Value;
  this.CurrentHP = creatureJson.HP.Value;

  this.InitiativeModifier = this.CalculateModifier(creatureJson.Attributes.Dex);
};

Creature.prototype.CalculateModifier = function(attribute)
{
  return Math.floor((attribute - 10) / 2)
};

encounter = new Encounter();
chrome.app.window.create('creatures.html', {
  'outerBounds': {
      'left': 800,
      'top': 100,
      'width': 400,
      'height': 500
    }
	},
	function(creatureWindow){
		creatureWindow.contentWindow.encounter = encounter;
	});

var viewModel = {
                  encounter: ko.observable(encounter)
                };
$(document).ready(function(){
  ko.applyBindings(viewModel);  
})

