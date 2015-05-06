/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />
var Rules = (function () {
    function Rules() {
    }
    Rules.prototype.CalculateModifier = function (attribute) {
        return Math.floor((attribute - 10) / 2);
    };
    Rules.prototype.AbilityCheck = function (mods) {
        return Math.ceil(Math.random() * 20) + mods.reduce(function (p, c) { return p + c; });
    };
    return Rules;
})();
var Encounter = (function () {
    function Encounter() {
        this.creatures = ko.observableArray();
        this.selectedCreature = ko.observable();
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
    Encounter.prototype.relativeNavigateFocus = function (offset) {
        var newIndex = this.creatures.indexOf(this.selectedCreature()) + offset;
        if (newIndex < 0) {
            newIndex = 0;
        }
        else if (newIndex >= this.creatures().length) {
            newIndex = this.creatures().length - 1;
        }
        this.selectedCreature(this.creatures()[newIndex]);
    };
    Encounter.prototype.selectPreviousCombatant = function () {
        this.relativeNavigateFocus(-1);
    };
    Encounter.prototype.selectNextCombatant = function () {
        this.relativeNavigateFocus(1);
    };
    return Encounter;
})();
var Creature = (function () {
    function Creature(creatureJson, rules) {
        if (!creatureJson) {
            throw "Couldn't create Creature- no Json passed in.";
        }
        this.Rules = rules || new Rules();
        this.Name = creatureJson.Name;
        this.MaxHP = creatureJson.HP.Value;
        this.CurrentHP = creatureJson.HP.Value;
        this.InitiativeModifier = this.Rules.CalculateModifier(creatureJson.Attributes.Dex);
        this.StatBlock = creatureJson;
    }
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
function RegisterKeybindings(viewModel) {
    Mousetrap.bind('j', viewModel.encounter().selectNextCombatant);
    Mousetrap.bind('k', viewModel.encounter().selectPreviousCombatant);
}
$(function () {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function (json) {
        viewModel.creatures(json);
    });
});
