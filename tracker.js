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
        this.creatures.push(new Creature(creatureJson, this));
    };
    Encounter.prototype.sortByInitiative = function () {
        this.creatures.sort(function (l, r) { return r.Initiative() - l.Initiative(); });
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
    Encounter.prototype.focusSelectedCreatureHP = function () {
        if (this.selectedCreature()) {
            this.selectedCreature().FocusHP(true);
        }
        return false;
    };
    Encounter.prototype.RollInitiative = function () {
        this.creatures().forEach(function (c) { c.RollInitiative(); });
        this.sortByInitiative();
    };
    return Encounter;
})();
var Creature = (function () {
    function Creature(creatureJson, encounter, rules) {
        if (!creatureJson) {
            throw "Couldn't create Creature- no Json passed in.";
        }
        this.Encounter = encounter;
        this.Rules = rules || new Rules();
        this.Name = creatureJson.Name;
        this.MaxHP = creatureJson.HP.Value;
        this.CurrentHP = ko.observable(creatureJson.HP.Value);
        this.HPChange = ko.observable(null);
        this.InitiativeModifier = this.Rules.CalculateModifier(creatureJson.Attributes.Dex);
        this.Initiative = ko.observable(0);
        this.StatBlock = creatureJson;
        this.FocusHP = ko.observable(false);
    }
    Creature.prototype.CommitHP = function () {
        this.CurrentHP(this.CurrentHP() - this.HPChange());
        this.HPChange(null);
        this.FocusHP(false);
    };
    Creature.prototype.GetHPColor = function () {
        var green = Math.floor((this.CurrentHP() / this.MaxHP) * 220);
        var red = Math.floor((this.MaxHP - this.CurrentHP()) / this.MaxHP * 255);
        return "rgb(" + red + "," + green + ",0)";
    };
    Creature.prototype.RollInitiative = function () {
        this.Initiative(this.Rules.AbilityCheck([this.InitiativeModifier]));
    };
    return Creature;
})();
var ViewModel = (function () {
    function ViewModel() {
        var self = this;
        this.encounter = ko.observable(new Encounter());
        this.creatures = ko.observableArray();
    }
    return ViewModel;
})();
function RegisterKeybindings(viewModel) {
    Mousetrap.bind('j', viewModel.encounter().selectNextCombatant.bind(viewModel.encounter()));
    Mousetrap.bind('k', viewModel.encounter().selectPreviousCombatant.bind(viewModel.encounter()));
    Mousetrap.bind('t', viewModel.encounter().focusSelectedCreatureHP.bind(viewModel.encounter()));
}
$(function () {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function (json) {
        viewModel.creatures(json);
    });
});
