/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />
var StatBlock = (function () {
    function StatBlock() {
    }
    StatBlock.Empty = { Name: 'None', HP: { Value: 0 }, Attributes: { Str: 0, Dex: 0, Con: 0, Cha: 0, Int: 0, Wis: 0 } };
    return StatBlock;
})();
var DefaultRules = (function () {
    function DefaultRules() {
        this.CalculateModifier = function (attribute) {
            return Math.floor((attribute - 10) / 2);
        };
        this.Check = function (mods) {
            return Math.ceil(Math.random() * 20) + mods.reduce(function (p, c) { return p + c; });
        };
        this.GroupSimilarCreatures = false;
    }
    return DefaultRules;
})();
var Encounter = (function () {
    function Encounter(rules) {
        var _this = this;
        this.sortByInitiative = function () {
            _this.creatures.sort(function (l, r) { return (r.Initiative() - l.Initiative()) ||
                (r.InitiativeModifier - l.InitiativeModifier); });
        };
        this.moveCreature = function (creature, index) {
            _this.creatures.remove(creature);
            _this.creatures.splice(index, 0, creature);
        };
        this.relativeNavigateFocus = function (offset) {
            var newIndex = _this.creatures.indexOf(_this.SelectedCreature()) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            }
            else if (newIndex >= _this.creatures().length) {
                newIndex = _this.creatures().length - 1;
            }
            _this.SelectedCreature(_this.creatures()[newIndex]);
        };
        this.AddCreature = function (creatureJson) {
            console.log("adding %O", creatureJson);
            _this.creatures.push(new Creature(creatureJson, _this));
        };
        this.SelectPreviousCombatant = function () {
            _this.relativeNavigateFocus(-1);
        };
        this.SelectNextCombatant = function () {
            _this.relativeNavigateFocus(1);
        };
        this.FocusSelectedCreatureHP = function () {
            if (_this.SelectedCreature()) {
                _this.SelectedCreature().FocusHP(true);
            }
            return false;
        };
        this.MoveSelectedCreatureUp = function () {
            var creature = _this.SelectedCreature();
            var index = _this.creatures.indexOf(creature);
            if (creature && index > 0) {
                _this.moveCreature(creature, index - 1);
            }
        };
        this.MoveSelectedCreatureDown = function () {
            var creature = _this.SelectedCreature();
            var index = _this.creatures.indexOf(creature);
            if (creature && index < _this.creatures().length - 1) {
                _this.moveCreature(creature, index + 1);
            }
        };
        this.RollInitiative = function () {
            if (_this.Rules.GroupSimilarCreatures) {
                var initiatives = [];
                _this.creatures().forEach(function (c) {
                    if (initiatives[c.Name] === undefined) {
                        initiatives[c.Name] = c.RollInitiative();
                    }
                    c.Initiative(initiatives[c.Name]);
                });
            }
            else {
                _this.creatures().forEach(function (c) { c.RollInitiative(); });
            }
            _this.sortByInitiative();
        };
        this.creatures = ko.observableArray();
        this.SelectedCreature = ko.observable();
        this.Rules = rules || new DefaultRules();
        this.SelectedCreatureStatblock = ko.computed(function () {
            return _this.SelectedCreature()
                ? _this.SelectedCreature().StatBlock
                : StatBlock.Empty;
        });
    }
    return Encounter;
})();
var Creature = (function () {
    function Creature(creatureJson, encounter, rules) {
        var _this = this;
        this.setAlias = function (name) {
            var others = _this.Encounter.creatures().filter(function (c) { return c !== _this && c.Name === name; });
            if (others.length === 1) {
                others[0].Alias(name + " 1");
            }
            return ko.observable(name + " " + (others.length + 1));
        };
        this.CommitHP = function () {
            _this.CurrentHP(_this.CurrentHP() - _this.HPChange());
            _this.HPChange(null);
            _this.FocusHP(false);
        };
        this.GetHPColor = function () {
            var green = Math.floor((_this.CurrentHP() / _this.MaxHP) * 220);
            var red = Math.floor((_this.MaxHP - _this.CurrentHP()) / _this.MaxHP * 255);
            return "rgb(" + red + "," + green + ",0)";
        };
        this.RollInitiative = function () {
            var roll = _this.Encounter.Rules.Check([_this.InitiativeModifier]);
            _this.Initiative(roll);
            return roll;
        };
        this.AbilityCheck = function (attribute, mods) {
            var abilityScore = _this.StatBlock.Attributes[attribute];
            if (abilityScore === undefined) {
                throw "attribute " + attribute + " not on creatures " + _this.Alias();
            }
            mods.push(_this.Encounter.Rules.CalculateModifier(abilityScore));
            return _this.Encounter.Rules.Check(mods);
        };
        if (!creatureJson) {
            throw "Couldn't create Creature- no Json passed in.";
        }
        this.Encounter = encounter;
        this.Name = creatureJson.Name;
        this.Alias = this.setAlias(this.Name);
        this.MaxHP = creatureJson.HP.Value;
        this.CurrentHP = ko.observable(creatureJson.HP.Value);
        this.HPChange = ko.observable(null);
        this.InitiativeModifier = this.Encounter.Rules.CalculateModifier(creatureJson.Attributes.Dex);
        this.Initiative = ko.observable(0);
        this.StatBlock = creatureJson;
        this.FocusHP = ko.observable(false);
    }
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
    Mousetrap.bind('j', viewModel.encounter().SelectNextCombatant);
    Mousetrap.bind('k', viewModel.encounter().SelectPreviousCombatant);
    Mousetrap.bind('t', viewModel.encounter().FocusSelectedCreatureHP);
    Mousetrap.bind('alt+r', viewModel.encounter().RollInitiative);
    Mousetrap.bind('alt+j', viewModel.encounter().MoveSelectedCreatureDown);
    Mousetrap.bind('alt+k', viewModel.encounter().MoveSelectedCreatureUp);
}
$(function () {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function (json) {
        viewModel.creatures(json);
        viewModel.creatures().forEach(viewModel.encounter().AddCreature);
        viewModel.creatures().forEach(viewModel.encounter().AddCreature);
        viewModel.creatures().forEach(viewModel.encounter().AddCreature);
    });
});
