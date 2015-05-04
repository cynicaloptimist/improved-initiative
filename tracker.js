/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var Encounter = (function () {
    function Encounter() {
    }
    Encounter.prototype.addCreature = function (creatureJson) {
        console.log("adding %O", creatureJson);
        var encounterIndex = this.creatures.push(creatureJson) - 1;
        var creature = new Creature(creatureJson);
    };
    Encounter.prototype.getCreatures = function (filter) {
        if (typeof filter === 'function') {
            return this.creatures.filter(filter);
        }
        return this.creatures;
    };
    ;
    return Encounter;
})();
;
var Creature = (function () {
    function Creature(creatureJson) {
        this.CalculateModifier = function (attribute) {
            return Math.floor((attribute - 10) / 2);
        };
        if (!creatureJson) {
            throw "Couldn't create Creature- no Json passed in.";
        }
        this.Name = creatureJson.Name;
        this.MaxHP = creatureJson.HP.Value;
        this.CurrentHP = creatureJson.HP.Value;
        this.InitiativeModifier = this.CalculateModifier(creatureJson.Attributes.Dex);
    }
    return Creature;
})();
var encounter = new Encounter();
var loadCreatures = function (containers, creatures) {
    if (creatures.length) {
        creatures.forEach(function (creature, index) {
            containers.append("<p creature-index='" + index + "'>" + creature.Name + "</p>");
        });
    }
};
var creatures;
var addCreature = function () {
    var creature = creatures[$(this).attr('creature-index')];
    encounter.addCreature(creature);
};
var initialize = function () {
};
var viewModel = {
    encounter: ko.observable(encounter)
};
$(function () {
    $.getJSON('creatures.json', function (json) {
        creatures = json;
        loadCreatures($('.creatures'), creatures);
        $('.creatures p').click(addCreature);
    });
    ko.applyBindings(viewModel);
});
