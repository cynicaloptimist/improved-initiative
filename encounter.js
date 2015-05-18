var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Encounter = (function () {
        function Encounter(rules) {
            var _this = this;
            //ResponseRequest: KnockoutComputed<string>;
            this.sortByInitiative = function () {
                _this.Creatures.sort(function (l, r) { return (r.Initiative() - l.Initiative()) ||
                    (r.InitiativeModifier - l.InitiativeModifier); });
            };
            this.moveCreature = function (creature, index) {
                _this.Creatures.remove(creature);
                _this.Creatures.splice(index, 0, creature);
            };
            this.relativeNavigateFocus = function (offset) {
                var newIndex = _this.Creatures.indexOf(_this.SelectedCreature()) + offset;
                if (newIndex < 0) {
                    newIndex = 0;
                }
                else if (newIndex >= _this.Creatures().length) {
                    newIndex = _this.Creatures().length - 1;
                }
                _this.SelectedCreature(_this.Creatures()[newIndex]);
            };
            this.AddCreature = function (creatureJson) {
                console.log("adding %O", creatureJson);
                if (creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player') {
                    _this.Creatures.push(new ImprovedInitiative.PlayerCharacter(creatureJson, _this));
                }
                else {
                    _this.Creatures.push(new ImprovedInitiative.Creature(creatureJson, _this));
                }
            };
            this.RemoveSelectedCreature = function () {
                _this.Creatures.remove(_this.SelectedCreature());
            };
            this.SelectPreviousCombatant = function () {
                _this.relativeNavigateFocus(-1);
            };
            this.SelectNextCombatant = function () {
                _this.relativeNavigateFocus(1);
            };
            this.FocusSelectedCreatureHP = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().EditHP(true);
                }
                return false;
            };
            this.AddSelectedCreatureTag = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().AddingTag(true);
                }
                return false;
            };
            this.MoveSelectedCreatureUp = function () {
                var creature = _this.SelectedCreature();
                var index = _this.Creatures.indexOf(creature);
                if (creature && index > 0) {
                    _this.moveCreature(creature, index - 1);
                }
            };
            this.MoveSelectedCreatureDown = function () {
                var creature = _this.SelectedCreature();
                var index = _this.Creatures.indexOf(creature);
                if (creature && index < _this.Creatures().length - 1) {
                    _this.moveCreature(creature, index + 1);
                }
            };
            this.EditSelectedCreatureName = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().EditName(true);
                }
            };
            this.RequestInitiative = function (playercharacter) {
                _this.UserResponseRequests.push(new ImprovedInitiative.UserResponseRequest("<p>Initiative Roll for " + playercharacter.Alias() + " (" + playercharacter.InitiativeModifier.toModifierString() + "): <input class='response' type='number' value='" + _this.Rules.Check(playercharacter.InitiativeModifier) + "' /></p>", '.response', function (response) {
                    playercharacter.Initiative(parseInt(response));
                    _this.sortByInitiative();
                }, _this.UserResponseRequests));
            };
            this.FocusResponseRequest = function () {
                $('form input').select();
            };
            this.RollInitiative = function () {
                if (_this.Rules.GroupSimilarCreatures) {
                    var initiatives = [];
                    _this.Creatures().forEach(function (c) {
                        if (initiatives[c.Name] === undefined) {
                            initiatives[c.Name] = c.RollInitiative();
                        }
                        c.Initiative(initiatives[c.Name]);
                    });
                }
                else {
                    _this.Creatures().forEach(function (c) { c.RollInitiative(); });
                }
                _this.sortByInitiative();
                _this.ActiveCreature(_this.Creatures()[0]);
            };
            this.NextTurn = function () {
                var nextIndex = _this.Creatures().indexOf(_this.ActiveCreature()) + 1;
                if (nextIndex >= _this.Creatures().length) {
                    nextIndex = 0;
                }
                _this.ActiveCreature(_this.Creatures()[nextIndex]);
            };
            this.PreviousTurn = function () {
                var previousIndex = _this.Creatures().indexOf(_this.ActiveCreature()) - 1;
                if (previousIndex < 0) {
                    previousIndex = _this.Creatures().length - 1;
                }
                _this.ActiveCreature(_this.Creatures()[previousIndex]);
            };
            this.Rules = rules || new ImprovedInitiative.DefaultRules();
            this.Creatures = ko.observableArray();
            this.SelectedCreature = ko.observable();
            this.UserResponseRequests = ko.observableArray();
            //this.ResponseRequest = ko.computed(() => (this.UserResponseRequests()[0] || {requestContent: ''}).requestContent)
            this.SelectedCreatureStatblock = ko.computed(function () {
                return _this.SelectedCreature()
                    ? _this.SelectedCreature().StatBlock
                    : ImprovedInitiative.StatBlock.Empty();
            });
            this.ActiveCreature = ko.observable();
            this.ActiveCreatureStatblock = ko.computed(function () {
                return _this.ActiveCreature()
                    ? _this.ActiveCreature().StatBlock
                    : ImprovedInitiative.StatBlock.Empty();
            });
        }
        return Encounter;
    })();
    ImprovedInitiative.Encounter = Encounter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
