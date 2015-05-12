/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout/bindinghandlers.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />
var StatBlock = (function () {
    function StatBlock() {
    }
    StatBlock.Empty = function () { return ({
        Name: '', Type: '',
        HP: { Value: 1, Notes: '' }, AC: { Value: 10, Notes: '' },
        Speed: [],
        Attributes: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
        DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
        Saves: [], Skills: [], Senses: [], Languages: [],
        Challenge: 0,
        Traits: [],
        Actions: [],
        LegendaryActions: []
    }); };
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
        this.RemoveSelectedCreature = function () {
            _this.creatures.remove(_this.SelectedCreature());
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
        this.EditSelectedCreatureName = function () {
            if (_this.SelectedCreature()) {
                _this.SelectedCreature().EditName(true);
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
            _this.ActiveCreature(_this.creatures()[0]);
        };
        this.NextTurn = function () {
            var nextIndex = _this.creatures().indexOf(_this.ActiveCreature()) + 1;
            if (nextIndex >= _this.creatures().length) {
                nextIndex = 0;
            }
            _this.ActiveCreature(_this.creatures()[nextIndex]);
        };
        this.Rules = rules || new DefaultRules();
        this.creatures = ko.observableArray();
        this.SelectedCreature = ko.observable();
        this.SelectedCreatureStatblock = ko.computed(function () {
            return _this.SelectedCreature()
                ? _this.SelectedCreature().StatBlock
                : StatBlock.Empty();
        });
        this.ActiveCreature = ko.observable();
        this.ActiveCreatureStatblock = ko.computed(function () {
            return _this.ActiveCreature()
                ? _this.ActiveCreature().StatBlock
                : StatBlock.Empty();
        });
    }
    return Encounter;
})();
var Creature = (function () {
    function Creature(creatureJson, encounter, rules) {
        var _this = this;
        this.setAlias = function (name) {
            var others = _this.Encounter.creatures().filter(function (c) { return c !== _this && c.Name === name; });
            if (others.length === 0) {
                return ko.observable(name);
            }
            if (others.length === 1) {
                others[0].Alias(name + " 1");
            }
            return ko.observable(name + " " + (others.length + 1));
        };
        this.calculateModifiers = function () {
            var modifiers = StatBlock.Empty().Attributes;
            for (var attribute in _this.StatBlock.Attributes) {
                modifiers[attribute] = _this.Encounter.Rules.CalculateModifier(_this.StatBlock.Attributes[attribute]);
            }
            return modifiers;
        };
        this.calculateSaves = function () {
            var saves = _this.AbilityModifiers;
            for (var _i = 0, _a = _this.StatBlock.Saves; _i < _a.length; _i++) {
                var save = _a[_i];
                saves[save.Name] = save.Value;
            }
            return saves;
        };
        this.CommitHP = function () {
            _this.CurrentHP(_this.CurrentHP() - _this.HPChange());
            _this.HPChange(null);
            _this.FocusHP(false);
        };
        this.CommitName = function () {
            _this.EditName(false);
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
        this.StatBlock = StatBlock.Empty();
        jQuery.extend(this.StatBlock, creatureJson);
        this.Encounter = encounter;
        this.Name = this.StatBlock.Name;
        this.Alias = this.setAlias(this.Name);
        this.MaxHP = this.StatBlock.HP.Value;
        this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
        this.HPChange = ko.observable(null);
        this.AbilityModifiers = this.calculateModifiers();
        this.AC = this.StatBlock.AC.Value;
        this.Saves = this.calculateSaves();
        this.InitiativeModifier = this.Encounter.Rules.CalculateModifier(this.StatBlock.Attributes.Dex);
        this.Initiative = ko.observable(0);
        this.FocusHP = ko.observable(false);
        this.EditName = ko.observable(false);
    }
    return Creature;
})();
var ViewModel = (function () {
    function ViewModel() {
        var _this = this;
        this.encounter = ko.observable(new Encounter());
        this.creatures = ko.observableArray();
        this.LibraryFilter = ko.observable('');
        this.FilteredCreatures = ko.computed(function () {
            var filter = _this.LibraryFilter();
            if (filter.length == 0) {
                return _this.creatures();
            }
            return _this.creatures().filter(function (v) {
                return v.Name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
            });
        });
    }
    return ViewModel;
})();
function RegisterKeybindings(viewModel) {
    Mousetrap.bind('j', viewModel.encounter().SelectNextCombatant);
    Mousetrap.bind('k', viewModel.encounter().SelectPreviousCombatant);
    Mousetrap.bind('n', viewModel.encounter().NextTurn);
    Mousetrap.bind('t', viewModel.encounter().FocusSelectedCreatureHP);
    Mousetrap.bind('del', viewModel.encounter().RemoveSelectedCreature);
    Mousetrap.bind('f2', viewModel.encounter().EditSelectedCreatureName);
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
    });
});
