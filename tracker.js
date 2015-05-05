/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var Encounter = (function () {
    function Encounter() {
        this.creatures = ko.observableArray();
    }
    Encounter.prototype.addCreature = function (creatureJson) {
        console.log("adding %O", creatureJson);
        this.creatures.push(new Creature(creatureJson));
    };
    Encounter.prototype.getCreatures = function (filter) {
        if (typeof filter === 'function') {
            return this.creatures().filter(filter);
        }
        return this.creatures();
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
var ViewModel = (function () {
    function ViewModel() {
        var self = this;
        this.encounter = ko.observable(new Encounter());
        this.creatures = ko.observableArray();
        this.AddCreature = function (data) {
            self.encounter().addCreature(data);
        };
    }
    return ViewModel;
})();
$(function () {
    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function (json) {
        viewModel.creatures(json);
    });
});
