var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Creature = (function () {
        function Creature(creatureJson, Encounter) {
            var _this = this;
            this.Encounter = Encounter;
            this.setAlias = function (name) {
                var others = _this.Encounter.Creatures().filter(function (c) { return c !== _this && c.Name === name; });
                if (others.length === 0) {
                    return ko.observable(name);
                }
                if (others.length === 1) {
                    others[0].Alias(name + " 1");
                }
                return ko.observable(name + " " + (others.length + 1));
            };
            this.calculateModifiers = function () {
                var modifiers = ImprovedInitiative.StatBlock.Empty().Attributes;
                for (var attribute in _this.StatBlock.Attributes) {
                    modifiers[attribute] = _this.Encounter.Rules.Modifier(_this.StatBlock.Attributes[attribute]);
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
                _this.EditHP(false);
            };
            this.CommitName = function () {
                _this.EditName(false);
            };
            this.CommitTag = function () {
                _this.Tags.push(_this.NewTag());
                _this.NewTag(null);
                _this.AddingTag(false);
            };
            this.RemoveTag = function (tag) {
                _this.Tags.splice(_this.Tags.indexOf(tag), 1);
            };
            this.GetHPColor = function () {
                var green = Math.floor((_this.CurrentHP() / _this.MaxHP) * 170);
                var red = Math.floor((_this.MaxHP - _this.CurrentHP()) / _this.MaxHP * 170);
                return "rgb(" + red + "," + green + ",0)";
            };
            this.RollInitiative = function () {
                var roll = _this.Encounter.Rules.Check(_this.InitiativeModifier);
                _this.Initiative(roll);
                return roll;
            };
            this.StatBlock = ImprovedInitiative.StatBlock.Empty();
            jQuery.extend(this.StatBlock, creatureJson);
            this.Name = this.StatBlock.Name;
            this.Alias = this.setAlias(this.Name);
            this.MaxHP = this.StatBlock.HP.Value;
            this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
            this.HPChange = ko.observable(null);
            this.AbilityModifiers = this.calculateModifiers();
            this.AC = this.StatBlock.AC.Value;
            this.Saves = this.calculateSaves();
            this.Tags = ko.observableArray();
            this.NewTag = ko.observable();
            this.InitiativeModifier = this.StatBlock.InitiativeModifier || this.Encounter.Rules.Modifier(this.StatBlock.Attributes.Dex);
            this.Initiative = ko.observable(0);
            this.EditHP = ko.observable(false);
            this.EditName = ko.observable(false);
            this.AddingTag = ko.observable(false);
        }
        return Creature;
    })();
    ImprovedInitiative.Creature = Creature;
})(ImprovedInitiative || (ImprovedInitiative = {}));
