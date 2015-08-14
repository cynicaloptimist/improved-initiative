var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CombatantViewModel = (function () {
        function CombatantViewModel(Creature, PollUser) {
            var _this = this;
            this.Creature = Creature;
            this.PollUser = PollUser;
            this.applyDamage = function (inputDamage) {
                var damage = parseInt(inputDamage), healing = -damage, currHP = _this.Creature.CurrentHP(), tempHP = _this.Creature.TemporaryHP();
                if (isNaN(damage)) {
                    return;
                }
                if (damage > 0) {
                    tempHP -= damage;
                    if (tempHP < 0) {
                        currHP += tempHP;
                        tempHP = 0;
                    }
                }
                else {
                    currHP += healing;
                    if (currHP > _this.Creature.MaxHP) {
                        currHP = _this.Creature.MaxHP;
                    }
                }
                _this.Creature.CurrentHP(currHP);
                _this.Creature.TemporaryHP(tempHP);
            };
            this.applyTemporaryHP = function (inputTHP) {
                var newTemporaryHP = parseInt(inputTHP), currentTemporaryHP = _this.Creature.TemporaryHP();
                if (isNaN(newTemporaryHP)) {
                    return;
                }
                if (newTemporaryHP > currentTemporaryHP) {
                    currentTemporaryHP = newTemporaryHP;
                }
                _this.Creature.TemporaryHP(currentTemporaryHP);
            };
            this.GetHPColor = function () {
                var green = Math.floor((_this.Creature.CurrentHP() / _this.Creature.MaxHP) * 170);
                var red = Math.floor((_this.Creature.MaxHP - _this.Creature.CurrentHP()) / _this.Creature.MaxHP * 170);
                return "rgb(" + red + "," + green + ",0)";
            };
            this.EditHP = function () {
                _this.PollUser({
                    requestContent: "Apply damage to " + _this.DisplayName() + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: _this.applyDamage
                });
            };
            this.EditInitiative = function () {
                _this.PollUser({
                    requestContent: "Update initiative for " + _this.DisplayName() + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: _this.Creature.Initiative
                });
            };
            this.AddTemporaryHP = function () {
                _this.PollUser({
                    requestContent: "Grant temporary hit points to " + _this.DisplayName() + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: _this.applyTemporaryHP
                });
            };
            this.HiddenClass = ko.computed(function () {
                return _this.Creature.Hidden() ? 'fa-eye-slash' : 'fa-eye';
            });
            this.ToggleHidden = function (data, event) {
                _this.Creature.Hidden(!_this.Creature.Hidden());
            };
            this.DisplayName = ko.computed(function () {
                var alias = ko.unwrap(_this.Creature.Alias), creatureCounts = ko.unwrap(_this.Creature.Encounter.CreatureCountsByName), name = ko.unwrap(_this.Creature.StatBlock).Name, index = _this.Creature.IndexLabel;
                return alias ||
                    creatureCounts[name]() > 1 ?
                    name + " " + index :
                    name;
            });
            this.EditingName = ko.observable(false);
            this.CommitName = function () {
                _this.EditingName(false);
            };
            this.AddingTag = ko.observable(false);
            this.NewTag = ko.observable(null);
            this.CommitTag = function () {
                _this.Creature.Tags.push(_this.NewTag());
                _this.NewTag(null);
                _this.AddingTag(false);
            };
            this.RemoveTag = function (tag) {
                _this.Creature.Tags.splice(_this.Creature.Tags.indexOf(tag), 1);
            };
            this.DisplayHP = ko.pureComputed(function () {
                if (_this.Creature.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(_this.Creature.CurrentHP(), _this.Creature.TemporaryHP(), _this.Creature.MaxHP);
                }
                else {
                    return '{0}/{1}'.format(_this.Creature.CurrentHP(), _this.Creature.MaxHP);
                }
            });
            this.PlayerDisplayHP = ko.pureComputed(function () {
                if (_this.Creature.IsPlayerCharacter) {
                    return _this.DisplayHP();
                }
                if (_this.Creature.Encounter.Rules.EnemyHPTransparency == "whenBloodied") {
                    if (_this.Creature.CurrentHP() <= 0) {
                        return "<span class='defeatedHP'>Defeated</span>";
                    }
                    else if (_this.Creature.CurrentHP() < _this.Creature.MaxHP / 2) {
                        return "<span class='bloodiedHP'>Bloodied</span>";
                    }
                    else if (_this.Creature.CurrentHP() < _this.Creature.MaxHP) {
                        return "<span class='hurtHP'>Hurt</span>";
                    }
                    return "<span class='healthyHP'>Healthy</span>";
                }
                else {
                    if (_this.Creature.CurrentHP() <= 0) {
                        return "<span class='defeatedHP'>Defeated</span>";
                    }
                    return "<span class='healthyHP'>Healthy</span>";
                }
            });
        }
        return CombatantViewModel;
    })();
    ImprovedInitiative.CombatantViewModel = CombatantViewModel;
    ko.components.register('combatant', {
        viewModel: function (params) {
            params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
            return params.creature.ViewModel;
        },
        template: { name: 'combatant' }
    });
    ko.components.register('playerdisplaycombatant', {
        viewModel: function (params) {
            params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
            return params.creature.ViewModel;
        },
        template: { name: 'playerdisplaycombatant' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Command = (function () {
        function Command() {
        }
        return Command;
    })();
    ImprovedInitiative.Command = Command;
    ImprovedInitiative.BuildCommandList = function (v) { return [
        { Description: 'Roll Initiative',
            KeyBinding: 'alt+r',
            ActionBarIcon: 'fa-play',
            GetActionBinding: function () { return v.Encounter().RollInitiative; },
            ShowOnActionBar: ko.observable(true) },
        { Description: 'Open Creature Library',
            KeyBinding: 'alt+a',
            ActionBarIcon: 'fa-user-plus',
            GetActionBinding: function () { return v.ShowLibraries; },
            ShowOnActionBar: ko.observable(true) },
        { Description: 'Show Player Window',
            KeyBinding: 'alt+w',
            ActionBarIcon: 'fa-users',
            GetActionBinding: function () { return v.LaunchPlayerWindow; },
            ShowOnActionBar: ko.observable(true) },
        { Description: 'Select Next Combatant',
            KeyBinding: 'j',
            ActionBarIcon: 'fa-arrow-down',
            GetActionBinding: function () { return v.Encounter().SelectNextCombatant; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Select Previous Combatant',
            KeyBinding: 'k',
            ActionBarIcon: 'fa-arrow-up',
            GetActionBinding: function () { return v.Encounter().SelectPreviousCombatant; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Next Turn',
            KeyBinding: 'n',
            ActionBarIcon: 'fa-step-forward',
            GetActionBinding: function () { return v.Encounter().NextTurn; },
            ShowOnActionBar: ko.observable(true) },
        { Description: 'Previous Turn',
            KeyBinding: 'alt+n',
            ActionBarIcon: 'fa-step-backward',
            GetActionBinding: function () { return v.Encounter().PreviousTurn; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Damage/Heal Selected Combatant',
            KeyBinding: 't',
            ActionBarIcon: 'fa-plus-circle',
            GetActionBinding: function () { return v.Encounter().FocusSelectedCreatureHP; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Add Tag to Selected Combatant',
            KeyBinding: 'g',
            ActionBarIcon: 'fa-tag',
            GetActionBinding: function () { return v.Encounter().AddSelectedCreatureTag; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Remove Selected Combatant from Encounter',
            KeyBinding: 'del',
            ActionBarIcon: 'fa-remove',
            GetActionBinding: function () { return v.Encounter().RemoveSelectedCreature; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Rename Selected Combatant',
            KeyBinding: 'f2',
            ActionBarIcon: 'fa-i-cursor',
            GetActionBinding: function () { return v.Encounter().EditSelectedCreatureName; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Edit Selected Combatant',
            KeyBinding: 'alt+e',
            ActionBarIcon: 'fa-edit',
            GetActionBinding: function () { return v.Encounter().EditSelectedCreature; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Edit Selected Combatant Initiative',
            KeyBinding: 'alt+i',
            ActionBarIcon: 'fa-play-circle-o',
            GetActionBinding: function () { return v.Encounter().EditSelectedCreatureInitiative; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Move Selected Combatant Down',
            KeyBinding: 'alt+j',
            ActionBarIcon: 'fa-angle-double-down',
            GetActionBinding: function () { return v.Encounter().MoveSelectedCreatureDown; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Move Selected Combatant Up',
            KeyBinding: 'alt+k',
            ActionBarIcon: 'fa-angle-double-up',
            GetActionBinding: function () { return v.Encounter().MoveSelectedCreatureUp; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Add Temporary HP',
            KeyBinding: 'alt+t',
            ActionBarIcon: 'fa-medkit',
            GetActionBinding: function () { return v.Encounter().AddSelectedCreatureTemporaryHP; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Save Encounter',
            KeyBinding: 'alt+s',
            ActionBarIcon: 'fa-save',
            GetActionBinding: function () { return v.SaveEncounter; },
            ShowOnActionBar: ko.observable(false) },
        { Description: 'Show Keybindings',
            KeyBinding: '?',
            ActionBarIcon: 'fa-keyboard-o',
            GetActionBinding: function () { return v.ToggleCommandDisplay; },
            ShowOnActionBar: ko.observable(true) }
    ]; };
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var templateLoader = {
        loadTemplate: function (name, templateConfig, callback) {
            if (templateConfig.name) {
                var fullUrl = '/templates/' + templateConfig.name + '.html';
                $.get(fullUrl, function (markupString) {
                    // We need an array of DOM nodes, not a string.
                    // We can use the default loader to convert to the
                    // required format.
                    ko.components.defaultLoader.loadTemplate(name, markupString, callback);
                });
            }
            else {
                // Unrecognized config format. Let another loader handle it.
                callback(null);
            }
        }
    };
    ko.components.loaders.unshift(templateLoader);
    ko.components.register('defaultstatblock', {
        viewModel: function (params) { return params.creature; },
        template: { name: 'defaultstatblock' }
    });
    ko.components.register('activestatblock', {
        viewModel: function (params) { return params.creature; },
        template: { name: 'activestatblock' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Creature = (function () {
        function Creature(creatureJson, Encounter) {
            var _this = this;
            this.Encounter = Encounter;
            this.Alias = ko.observable(null);
            this.Hidden = ko.observable(false);
            this.IsPlayerCharacter = false;
            this.calculateModifiers = function () {
                var modifiers = ImprovedInitiative.StatBlock.Empty().Abilities;
                for (var attribute in _this.StatBlock().Abilities) {
                    modifiers[attribute] = _this.Encounter.Rules.Modifier(_this.StatBlock().Abilities[attribute]);
                }
                return modifiers;
            };
            this.RollInitiative = function () {
                var roll = _this.Encounter.Rules.Check(_this.InitiativeModifier);
                _this.Initiative(roll);
                return roll;
            };
            var statBlock = ImprovedInitiative.StatBlock.Empty();
            jQuery.extend(statBlock, creatureJson);
            this.StatBlock = ko.observable(statBlock);
            this.setIndexLabel();
            this.MaxHP = statBlock.HP.Value;
            this.CurrentHP = ko.observable(statBlock.HP.Value);
            this.TemporaryHP = ko.observable(0);
            this.AbilityModifiers = this.calculateModifiers();
            this.AC = statBlock.AC.Value;
            this.Tags = ko.observableArray();
            this.InitiativeModifier = statBlock.InitiativeModifier || this.Encounter.Rules.Modifier(statBlock.Abilities.Dex);
            this.Initiative = ko.observable(0);
            this.Initiative.subscribe(this.Encounter.SortByInitiative);
        }
        Creature.prototype.setIndexLabel = function () {
            var name = this.StatBlock().Name, counts = this.Encounter.CreatureCountsByName;
            if (!counts[name]) {
                counts[name] = ko.observable(1);
            }
            else {
                counts[name](counts[name]() + 1);
            }
            this.IndexLabel = counts[name]();
        };
        return Creature;
    })();
    ImprovedInitiative.Creature = Creature;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    ko.bindingHandlers.focusOnRender = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).find(valueAccessor()).select();
        }
    };
    ko.bindingHandlers.afterRender = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
            valueAccessor()(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };
    ko.bindingHandlers.onEnter = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var callback = valueAccessor();
            $(element).keypress(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };
    ko.bindingHandlers.uiText = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (ImprovedInitiative.uiText[valueAccessor()]) {
                $(element).html(ImprovedInitiative.uiText[valueAccessor()]);
            }
            else {
                $(element).html(valueAccessor());
            }
        }
    };
    ko.bindingHandlers.format = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            bindingContext['formatString'] = $(element).html();
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var replacements = ko.unwrap(valueAccessor());
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            $(element).html(bindingContext['formatString'].format(replacements));
        }
    };
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Encounter = (function () {
        function Encounter(UserPollQueue, StatBlockEditor, rules) {
            var _this = this;
            this.UserPollQueue = UserPollQueue;
            this.StatBlockEditor = StatBlockEditor;
            this.State = ko.observable('inactive');
            this.SortByInitiative = function () {
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
            this.AddCreature = function (creatureJson, event) {
                console.log("adding %O to encounter", creatureJson);
                var creature;
                if (creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player') {
                    creature = new ImprovedInitiative.PlayerCharacter(creatureJson, _this);
                }
                else {
                    creature = new ImprovedInitiative.Creature(creatureJson, _this);
                }
                if (event && event.altKey) {
                    creature.Hidden(true);
                }
                _this.Creatures.push(creature);
                return creature;
            };
            this.RemoveSelectedCreature = function () {
                var creature = ko.unwrap(_this.SelectedCreature), index = _this.Creatures.indexOf(creature);
                _this.Creatures.remove(creature);
                if (_this.Creatures().length <= index) {
                    _this.SelectedCreature(_this.Creatures()[index - 1]);
                }
                else {
                    _this.SelectedCreature(_this.Creatures()[index]);
                }
                //Only reset creature count if we just removed the last one of its kind.
                var deletedCreatureName = creature.StatBlock().Name;
                if (_this.Creatures().every(function (c) { return c.StatBlock().Name != deletedCreatureName; })) {
                    _this.CreatureCountsByName[deletedCreatureName](0);
                }
            };
            this.SelectPreviousCombatant = function () {
                _this.relativeNavigateFocus(-1);
            };
            this.SelectNextCombatant = function () {
                _this.relativeNavigateFocus(1);
            };
            this.FocusSelectedCreatureHP = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.EditHP();
                }
                return false;
            };
            this.AddSelectedCreatureTemporaryHP = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.AddTemporaryHP();
                }
                return false;
            };
            this.AddSelectedCreatureTag = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.AddingTag(true);
                }
                return false;
            };
            this.EditSelectedCreatureInitiative = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.EditInitiative();
                }
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
                    _this.SelectedCreature().ViewModel.EditingName(true);
                }
            };
            this.EditSelectedCreature = function () {
                var selectedCreature = _this.SelectedCreature();
                if (selectedCreature) {
                    _this.StatBlockEditor.EditCreature(_this.SelectedCreatureStatblock(), function (newStatBlock) {
                        selectedCreature.StatBlock(newStatBlock);
                    });
                }
            };
            this.RequestInitiative = function (playercharacter) {
                _this.UserPollQueue.Add({
                    requestContent: "<p>Initiative Roll for " + playercharacter.ViewModel.DisplayName() + " (" + playercharacter.InitiativeModifier.toModifierString() + "): <input class='response' type='number' value='" + _this.Rules.Check(playercharacter.InitiativeModifier) + "' /></p>",
                    inputSelector: '.response',
                    callback: function (response) {
                        playercharacter.Initiative(parseInt(response));
                    }
                });
            };
            this.FocusResponseRequest = function () {
                $('form input').select();
            };
            this.StartEncounter = function () {
                _this.State('active');
                _this.ActiveCreature(_this.Creatures()[0]);
            };
            this.EndEncounter = function () {
                _this.State('inactive');
                _this.ActiveCreature(null);
            };
            this.RollInitiative = function () {
                // Foreaching over the original array while we're rearranging it
                // causes unpredictable results- dupe it first.
                var creatures = _this.Creatures().slice();
                if (_this.Rules.GroupSimilarCreatures) {
                    var initiatives = [];
                    creatures.forEach(function (c) {
                        if (initiatives[c.StatBlock().Name] === undefined) {
                            initiatives[c.StatBlock().Name] = c.RollInitiative();
                        }
                        c.Initiative(initiatives[c.StatBlock().Name]);
                    });
                }
                else {
                    creatures.forEach(function (c) {
                        c.RollInitiative();
                    });
                    _this.UserPollQueue.Add({
                        callback: _this.StartEncounter
                    });
                }
                $('.libraries').slideUp();
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
            this.Save = function (name) {
                return {
                    Name: name,
                    Creatures: _this.Creatures().map(function (c) {
                        return {
                            Statblock: c.StatBlock(),
                            CurrentHP: c.CurrentHP(),
                            TemporaryHP: c.TemporaryHP(),
                            Initiative: c.Initiative(),
                            Alias: c.Alias(),
                            IndexLabel: c.IndexLabel,
                            Tags: c.Tags()
                        };
                    })
                };
            };
            this.AddSavedEncounter = function (e) {
                e.Creatures
                    .forEach(function (c) {
                    var creature = _this.AddCreature(c.Statblock);
                    creature.CurrentHP(c.CurrentHP);
                    creature.TemporaryHP(c.TemporaryHP);
                    creature.Initiative(c.Initiative);
                    creature.IndexLabel = c.IndexLabel;
                    creature.Alias(c.Alias);
                    creature.Tags(c.Tags);
                });
            };
            this.Rules = rules || new ImprovedInitiative.DefaultRules();
            this.Creatures = ko.observableArray();
            this.CreatureCountsByName = [];
            this.SelectedCreature = ko.observable();
            this.SelectedCreatureStatblock = ko.computed(function () {
                return _this.SelectedCreature()
                    ? _this.SelectedCreature().StatBlock()
                    : ImprovedInitiative.StatBlock.Empty();
            });
            this.ActiveCreature = ko.observable();
            this.ActiveCreatureStatblock = ko.computed(function () {
                return _this.ActiveCreature()
                    ? _this.ActiveCreature().StatBlock()
                    : ImprovedInitiative.StatBlock.Empty();
            });
        }
        return Encounter;
    })();
    ImprovedInitiative.Encounter = Encounter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CreatureLibrary = (function () {
        function CreatureLibrary(StatBlockEditor) {
            var _this = this;
            this.StatBlockEditor = StatBlockEditor;
            this.Creatures = ko.observableArray([]);
            this.Players = ko.observableArray([]);
            this.SavedEncounterIndex = ko.observableArray([]);
            this.PreviewCreature = ko.observable(null);
            this.AdjustPreviewPane = function () {
                var popPosition = $(event.target).position().top;
                var maxPopPosition = $(document).height() - $('.preview.statblock').height();
                if (popPosition > maxPopPosition) {
                    popPosition = maxPopPosition - 40;
                }
                $('.preview.statblock').css('top', popPosition).select();
            };
            this.HidePreviewPane = function () {
                if (!$('.preview.statblock').is(':hover')) {
                    _this.PreviewCreature(null);
                }
            };
            this.DisplayTab = ko.observable('Creatures');
            this.LibraryFilter = ko.observable('');
            this.FilteredCreatures = ko.computed(function () {
                var creatures = ko.unwrap(_this.Creatures), players = ko.unwrap(_this.Players), filter = (ko.unwrap(_this.LibraryFilter) || '').toLocaleLowerCase(), creaturesWithFilterInName = [], creaturesWithFilterInType = [];
                if (_this.DisplayTab() == 'Players') {
                    return players;
                }
                if (filter.length == 0) {
                    return creatures;
                }
                creatures.forEach(function (c) {
                    if (c().Name.toLocaleLowerCase().indexOf(filter) > -1) {
                        creaturesWithFilterInName.push(c);
                        return;
                    }
                    if (c().Type.toLocaleLowerCase().indexOf(filter) > -1) {
                        creaturesWithFilterInType.push(c);
                    }
                });
                return creaturesWithFilterInName.concat(creaturesWithFilterInType);
            });
            this.EditStatBlock = function (StatBlock, event) {
                var StatBlockObservable = _this.Creatures().filter(function (c) { return c() === StatBlock; })[0];
                _this.StatBlockEditor.EditCreature(StatBlock, function (newStatBlock) {
                    StatBlockObservable(newStatBlock);
                });
                return false;
            };
            this.AddNewPlayer = function () {
                var player = ImprovedInitiative.StatBlock.Empty(function (s) { s.Player = "player"; });
                player.Player = "player";
                _this.EditStatBlock(_this.AddCreature(player)());
            };
            this.AddNewCreature = function () {
                var creature = ImprovedInitiative.StatBlock.Empty();
                _this.EditStatBlock(_this.AddCreature(creature)());
            };
            this.AddPlayers = function (library) {
                library.forEach(function (c) { return _this.Players.push(ko.observable(c)); });
            };
            this.AddCreatures = function (library) {
                library.sort(function (c1, c2) {
                    return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
                }).forEach(function (c) { return _this.Creatures.push(ko.observable(c)); });
            };
            var savedEncounterList = localStorage.getItem('ImprovedInitiative.SavedEncounters');
            if (savedEncounterList && savedEncounterList != 'undefined') {
                JSON.parse(savedEncounterList).forEach(function (e) { return _this.SavedEncounterIndex.push(e); });
            }
        }
        CreatureLibrary.prototype.AddPlayer = function (player) {
            var observablePlayer = ko.observable(player);
            this.Players.push(observablePlayer);
            return observablePlayer;
        };
        CreatureLibrary.prototype.AddCreature = function (creature) {
            var observableCreature = ko.observable(creature);
            this.Creatures.push(observableCreature);
            return observableCreature;
        };
        return CreatureLibrary;
    })();
    ImprovedInitiative.CreatureLibrary = CreatureLibrary;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CreatureImporter = (function () {
        function CreatureImporter(creatureXml) {
            var _this = this;
            this.creatureXml = creatureXml;
            this.GetString = function (selector) {
                return $(_this.creatureXml).find(selector).html() || '';
            };
            this.GetJoinedStrings = function (selectors, delimiter) {
                if (delimiter === void 0) { delimiter = ', '; }
                return selectors.map(_this.GetString).reduce(function (p, c) {
                    return p + (c ? delimiter + c : '');
                });
            };
            this.GetInt = function (selector) {
                return parseInt(_this.GetString(selector));
            };
            this.GetArray = function (selector, token) {
                if (token === void 0) { token = ', '; }
                var arrayLine = _this.GetString(selector);
                if (arrayLine) {
                    return arrayLine.split(token);
                }
                return [];
            };
            this.GetModifier = function (nameSelector, valueSelector) {
                return {
                    Name: _this.GetString(nameSelector),
                    Value: _this.GetInt(valueSelector)
                };
            };
            this.GetNotes = function (valueSelector, notesSelector) {
                return {
                    Value: _this.GetInt(valueSelector),
                    Notes: _this.GetString(notesSelector)
                };
            };
            this.ToModifierSet = function (proficiencies) {
                if (!proficiencies) {
                    return [];
                }
                return proficiencies.trim().split(', ').map(function (p) {
                    var proficiencyWithModifier = p.split(/ [+-]/);
                    return { Name: proficiencyWithModifier[0].trim(), Modifier: parseInt(proficiencyWithModifier[1]) };
                });
            };
            this.GetProficiencies = function () {
                var proficiences = (_this.GetString('savingthrows') || '').split('Skills');
                var skills = _this.ToModifierSet(proficiences[1]);
                return {
                    Saves: _this.ToModifierSet(proficiences[0]),
                    Skills: _this.ToModifierSet(_this.GetString('skills')) || _this.ToModifierSet(proficiences[1])
                };
            };
            this.GetAbilities = function () {
                return {
                    Str: parseInt(_this.GetString('abilities>strength>score') || '10'),
                    Dex: parseInt(_this.GetString('abilities>dexterity>score') || '10'),
                    Con: parseInt(_this.GetString('abilities>constitution>score') || '10'),
                    Int: parseInt(_this.GetString('abilities>intelligence>score') || '10'),
                    Wis: parseInt(_this.GetString('abilities>wisdom>score') || '10'),
                    Cha: parseInt(_this.GetString('abilities>charisma>score') || '10'),
                };
            };
            this.GetUniqueTraits = function (selector) {
                return $(_this.creatureXml).find(selector).children().get()
                    .map(function (trait) {
                    return {
                        Name: $(trait).find('name').html(),
                        Content: $(trait).find('desc').html().replace('\\r', '<br />'),
                        Usage: '' //todo
                    };
                });
            };
        }
        return CreatureImporter;
    })();
    var LibraryImporter = (function () {
        function LibraryImporter() {
        }
        LibraryImporter.Import = function (xmlDoc) {
            var library = [];
            $(xmlDoc).find('npcdata>*').each(function (_, creatureXml) {
                var imp = new CreatureImporter(creatureXml);
                var creature = ImprovedInitiative.StatBlock.Empty();
                creature.Name = imp.GetString('name');
                creature.Type = imp.GetJoinedStrings(['size', 'type', 'subtype'], ' ') + ', ' + imp.GetString('alignment');
                creature.HP = imp.GetNotes('hp', 'hd');
                creature.AC = imp.GetNotes('ac', 'actext');
                creature.Speed = imp.GetArray('speed');
                creature.Abilities = imp.GetAbilities();
                var proficiencies = imp.GetProficiencies();
                creature.Saves = proficiencies.Saves;
                creature.Skills = proficiencies.Skills;
                creature.ConditionImmunities = imp.GetArray('conditionimmunities');
                creature.DamageImmunities = imp.GetArray('damageimmunities');
                creature.DamageResistances = imp.GetArray('damageresistances');
                creature.DamageVulnerabilities = imp.GetArray('damagevulnerabilities'); //todo: test this, no dragons with vulnerabilities
                creature.Senses = imp.GetArray('senses');
                creature.Languages = imp.GetArray('languages');
                creature.Challenge = imp.GetString('cr');
                creature.Traits = imp.GetUniqueTraits('traits');
                creature.Actions = imp.GetUniqueTraits('actions');
                creature.LegendaryActions = imp.GetUniqueTraits('legendaryactions');
                library.push(creature);
            });
            return library;
        };
        return LibraryImporter;
    })();
    ImprovedInitiative.LibraryImporter = LibraryImporter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var PlayerCharacter = (function (_super) {
        __extends(PlayerCharacter, _super);
        function PlayerCharacter() {
            var _this = this;
            _super.apply(this, arguments);
            this.IsPlayerCharacter = true;
            this.RollInitiative = function () {
                _this.Encounter.RequestInitiative(_this);
                return _this.Encounter.Rules.Check(_this.InitiativeModifier);
            };
        }
        return PlayerCharacter;
    })(ImprovedInitiative.Creature);
    ImprovedInitiative.PlayerCharacter = PlayerCharacter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var DefaultRules = (function () {
        function DefaultRules() {
            this.Modifier = function (attribute) {
                return Math.floor((attribute - 10) / 2);
            };
            this.Check = function () {
                var mods = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    mods[_i - 0] = arguments[_i];
                }
                return Math.ceil(Math.random() * 20) + mods.reduce(function (p, c) { return p + c; });
            };
            this.GroupSimilarCreatures = false;
            this.EnemyHPTransparency = "whenBloodied";
        }
        return DefaultRules;
    })();
    ImprovedInitiative.DefaultRules = DefaultRules;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var StatBlock = (function () {
        function StatBlock() {
        }
        StatBlock.Empty = function (mutator) {
            var statBlock = {
                Name: '', Type: '',
                HP: { Value: 1, Notes: '' }, AC: { Value: 10, Notes: '' },
                Speed: [],
                Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
                DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
                Saves: [], Skills: [], Senses: [], Languages: [],
                Challenge: '',
                Traits: [],
                Actions: [],
                LegendaryActions: [],
                Player: ''
            };
            if (mutator) {
                mutator(statBlock);
            }
            ;
            return statBlock;
        };
        StatBlock.AbilityNames = ["Str", "Dex", "Con", "Cha", "Int", "Wis"];
        return StatBlock;
    })();
    ImprovedInitiative.StatBlock = StatBlock;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var StatBlockEditor = (function () {
        function StatBlockEditor() {
            var _this = this;
            this.StatBlock = ko.observable();
            this.editorType = ko.observable('basic');
            this.statBlockJson = ko.observable();
            this.EditCreature = function (StatBlock, callback) {
                _this.StatBlock(StatBlock);
                _this.statBlockJson(JSON.stringify(StatBlock, null, 2));
                _this.callback = callback;
            };
            this.SaveCreature = function () {
                if (_this.editorType() === 'advanced') {
                    var editedCreature = JSON.parse(_this.statBlockJson());
                    $.extend(_this.StatBlock(), editedCreature);
                }
                _this.callback(_this.StatBlock());
                _this.StatBlock(null);
            };
        }
        return StatBlockEditor;
    })();
    ImprovedInitiative.StatBlockEditor = StatBlockEditor;
    ko.components.register('editstatblock', {
        viewModel: function (params) { return params.editor; },
        template: { name: 'editstatblock' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
Number.prototype.toModifierString = function () {
    if (this >= 0) {
        return "+" + this;
    }
    return this;
};
String.prototype.format = function () {
    var args;
    if (arguments[0] instanceof Array) {
        args = arguments[0];
    }
    else {
        args = arguments;
    }
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
        if (m == "{{") {
            return "{";
        }
        if (m == "}}") {
            return "}";
        }
        if (args[n] === null || args[n] === undefined) {
            return "{" + n + "}";
        }
        return args[n];
    });
};
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
var ImprovedInitiative;
(function (ImprovedInitiative) {
    ImprovedInitiative.uiText = {
        'LegendaryActions': 'Legendary Actions',
        'DamageVulnerabilities': 'Damage Vulnerabilities',
        'DamageResistances': 'Damage Resistances',
        'DamageImmunities': 'Damage Immunities',
        'ConditionImmunities': 'Condition Immunities'
    };
    var ViewModel = (function () {
        function ViewModel() {
            var _this = this;
            this.UserPollQueue = new ImprovedInitiative.UserPollQueue();
            this.StatBlockEditor = new ImprovedInitiative.StatBlockEditor();
            this.Encounter = ko.observable(new ImprovedInitiative.Encounter(this.UserPollQueue, this.StatBlockEditor));
            this.Library = new ImprovedInitiative.CreatureLibrary(this.StatBlockEditor);
            this.SaveEncounter = function () {
                _this.UserPollQueue.Add({
                    requestContent: "<p>Save Encounter As: <input class='response' type='text' value='' /></p>",
                    inputSelector: '.response',
                    callback: function (response) {
                        var savedEncounter = _this.Encounter().Save(response);
                        var savedEncounters = _this.Library.SavedEncounterIndex;
                        if (savedEncounters.indexOf(response) == -1) {
                            savedEncounters().push(response);
                        }
                        localStorage.setItem('ImprovedInitiative.SavedEncounters', JSON.stringify(savedEncounters()));
                        localStorage.setItem("ImprovedInitiative.SavedEncounters." + response, JSON.stringify(savedEncounter));
                    }
                });
            };
            this.LoadEncounterByName = function (encounterName) {
                var encounterJSON = localStorage.getItem("ImprovedInitiative.SavedEncounters." + encounterName);
                if (encounterJSON === 'undefined') {
                    throw "Couldn't find encounter '" + encounterName + "'";
                }
                _this.Encounter().Creatures([]);
                _this.Encounter().CreatureCountsByName = [];
                _this.Encounter().AddSavedEncounter(JSON.parse(encounterJSON));
                _this.RegisterKeybindings();
            };
            this.LaunchPlayerWindow = function () {
                var playerWindow = window.open('playerview.html', 'Player View');
                playerWindow.initChild = function (pWindow) {
                    pWindow.ko = ko;
                    pWindow.ko.applyBindings(_this, pWindow.document.body);
                };
            };
            this.ShowLibraries = function () {
                $('.libraries').slideDown();
            };
            this.Commands = ImprovedInitiative.BuildCommandList(this);
            this.ToggleCommandDisplay = function () {
                if ($('.commands').toggle().css('display') == 'none') {
                    _this.RegisterKeybindings();
                }
            };
        }
        ViewModel.prototype.RegisterKeybindings = function () {
            Mousetrap.reset();
            this.Commands.forEach(function (b) { return Mousetrap.bind(b.KeyBinding, b.GetActionBinding()); });
        };
        return ViewModel;
    })();
    ImprovedInitiative.ViewModel = ViewModel;
    $(function () {
        if ($('#tracker').length) {
            var viewModel = new ViewModel();
            viewModel.RegisterKeybindings();
            ko.applyBindings(viewModel, document.body);
            $.ajax("user/creatures.json").done(viewModel.Library.AddCreatures).fail(function () {
                $.ajax("basic_rules_creatures.json").done(viewModel.Library.AddCreatures);
            });
            $.ajax("user/playercharacters.json").done(viewModel.Library.AddPlayers);
        }
        if ($('#playerview').length) {
            var waitForInitChild = function () {
                if (window['initChild']) {
                    window['initChild'](window);
                }
                else {
                    setTimeout(waitForInitChild, 500);
                }
            };
            waitForInitChild();
        }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var UserPollQueue = (function () {
        function UserPollQueue() {
            var _this = this;
            this.Queue = ko.observableArray();
            this.Add = function (poll) {
                _this.Queue.push(poll);
            };
            this.checkForAutoResolve = function () {
                var poll = _this.Queue()[0];
                if (poll && !poll.requestContent) {
                    poll.callback(null);
                    _this.Queue.shift();
                }
            };
            this.Resolve = function (form) {
                var poll = _this.Queue()[0];
                poll.callback($(form).find(poll.inputSelector).val());
                _this.Queue.shift();
                return false;
            };
            this.CurrentPoll = ko.pureComputed(function () {
                return _this.Queue()[0];
            });
            this.FocusCurrentPoll = function () {
                if (_this.Queue[0]) {
                    $(_this.Queue[0].inputSelector).select();
                }
            };
            this.Queue.subscribe(this.checkForAutoResolve);
        }
        return UserPollQueue;
    })();
    ImprovedInitiative.UserPollQueue = UserPollQueue;
})(ImprovedInitiative || (ImprovedInitiative = {}));
