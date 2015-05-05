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
        if (!creatureJson) {
            throw "Couldn't create Creature- no Json passed in.";
        }
        this.Name = creatureJson.Name;
        this.MaxHP = creatureJson.HP.Value;
        this.CurrentHP = creatureJson.HP.Value;
        this.InitiativeModifier = this.CalculateModifier(creatureJson.Attributes.Dex);
    }
    Creature.prototype.CalculateModifier = function (attribute) {
        return Math.floor((attribute - 10) / 2);
    };
    return Creature;
})();
var viewModel = {
    AddCreature: function (data) {
        console.log(data);
        this.Encounter().addCreature(data);
    },
    encounter: ko.observable(new Encounter()),
    creatures: ko.observableArray()
};
$(function () {
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function (json) {
        viewModel.creatures(json);
    });
});
