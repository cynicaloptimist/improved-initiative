/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
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
    ko.components.register('editstatblock', {
        viewModel: function (params) { return params.statblock; },
        template: { name: 'editstatblock' }
    });
    var CombatantViewModel = (function () {
        function CombatantViewModel(Creature) {
            var _this = this;
            this.Creature = Creature;
            this.GetHPColor = function () {
                var green = Math.floor((_this.Creature.CurrentHP() / _this.Creature.MaxHP) * 170);
                var red = Math.floor((_this.Creature.MaxHP - _this.Creature.CurrentHP()) / _this.Creature.MaxHP * 170);
                return "rgb(" + red + "," + green + ",0)";
            };
            this.EditingHP = ko.observable(false);
            this.AddingTemporaryHP = ko.observable(false);
            this.EditHP = function () {
                _this.EditingHP(true);
            };
            this.AddTemporaryHP = function () {
                _this.AddingTemporaryHP(true);
            };
            this.ShowHPInput = ko.pureComputed(function () {
                return _this.EditingHP() || _this.AddingTemporaryHP();
            });
            this.HPInput = ko.observable(null);
            this.CommitHP = function () {
                if (_this.EditingHP()) {
                    var damage = _this.HPInput(), healing = -_this.HPInput(), currHP = _this.Creature.CurrentHP(), tempHP = _this.Creature.TemporaryHP();
                    if (damage > 0) {
                        tempHP = -damage;
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
                    _this.EditingHP(false);
                }
                else if (_this.AddingTemporaryHP) {
                    var newTemporaryHP = _this.HPInput(), currentTemporaryHP = _this.Creature.TemporaryHP();
                    if (newTemporaryHP > currentTemporaryHP) {
                        currentTemporaryHP = newTemporaryHP;
                    }
                    _this.Creature.TemporaryHP(currentTemporaryHP);
                    _this.AddingTemporaryHP(false);
                }
                _this.HPInput(null);
            };
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
        }
        return CombatantViewModel;
    })();
    ImprovedInitiative.CombatantViewModel = CombatantViewModel;
    ko.components.register('combatant', {
        viewModel: function (params) {
            params.creature.ViewModel = new CombatantViewModel(params.creature);
            return params.creature.ViewModel;
        },
        template: { name: 'combatant' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Creature = (function () {
        function Creature(creatureJson, Encounter) {
            var _this = this;
            this.Encounter = Encounter;
            this.SetAlias = function (name) {
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
                var modifiers = ImprovedInitiative.StatBlock.Empty().Abilities;
                for (var attribute in _this.StatBlock.Abilities) {
                    modifiers[attribute] = _this.Encounter.Rules.Modifier(_this.StatBlock.Abilities[attribute]);
                }
                return modifiers;
            };
            this.RollInitiative = function () {
                var roll = _this.Encounter.Rules.Check(_this.InitiativeModifier);
                _this.Initiative(roll);
                return roll;
            };
            this.StatBlock = ImprovedInitiative.StatBlock.Empty();
            jQuery.extend(this.StatBlock, creatureJson);
            this.Name = this.StatBlock.Name;
            this.Alias = this.SetAlias(this.Name);
            this.MaxHP = this.StatBlock.HP.Value;
            this.CurrentHP = ko.observable(this.StatBlock.HP.Value);
            this.TemporaryHP = ko.observable(0);
            this.AbilityModifiers = this.calculateModifiers();
            this.AC = this.StatBlock.AC.Value;
            this.Tags = ko.observableArray();
            this.InitiativeModifier = this.StatBlock.InitiativeModifier || this.Encounter.Rules.Modifier(this.StatBlock.Abilities.Dex);
            this.Initiative = ko.observable(0);
        }
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
        function Encounter(UserPollQueue, rules) {
            var _this = this;
            this.UserPollQueue = UserPollQueue;
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
                console.log("adding %O to encounter", creatureJson);
                if (creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player') {
                    var creature = new ImprovedInitiative.PlayerCharacter(creatureJson, _this);
                }
                else {
                    var creature = new ImprovedInitiative.Creature(creatureJson, _this);
                }
                _this.Creatures.push(creature);
                return creature;
            };
            this.RemoveSelectedCreature = function () {
                var index = _this.Creatures.indexOf(_this.SelectedCreature());
                _this.Creatures.remove(_this.SelectedCreature());
                if (_this.Creatures().length <= index) {
                    _this.SelectedCreature(_this.Creatures()[index - 1]);
                }
                else {
                    _this.SelectedCreature(_this.Creatures()[index]);
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
                    _this.SelectedCreature().ViewModel.EditingHP(true);
                }
                return false;
            };
            this.AddSelectedCreatureTemporaryHP = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.AddingTemporaryHP(true);
                }
                return false;
            };
            this.AddSelectedCreatureTag = function () {
                if (_this.SelectedCreature()) {
                    _this.SelectedCreature().ViewModel.AddingTag(true);
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
                    _this.SelectedCreature().ViewModel.EditingName(true);
                }
            };
            this.RequestInitiative = function (playercharacter) {
                _this.UserPollQueue.Add({
                    requestContent: "<p>Initiative Roll for " + playercharacter.Alias() + " (" + playercharacter.InitiativeModifier.toModifierString() + "): <input class='response' type='number' value='" + _this.Rules.Check(playercharacter.InitiativeModifier) + "' /></p>",
                    inputSelector: '.response',
                    callback: function (response) {
                        playercharacter.Initiative(parseInt(response));
                        _this.sortByInitiative();
                    }
                });
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
                            Statblock: c.StatBlock,
                            CurrentHP: c.CurrentHP(),
                            TemporaryHP: c.TemporaryHP(),
                            Initiative: c.Initiative(),
                            Alias: c.Alias(),
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
                    creature.Alias(c.Alias);
                    creature.Tags(c.Tags);
                });
            };
            this.Rules = rules || new ImprovedInitiative.DefaultRules();
            this.Creatures = ko.observableArray();
            this.SelectedCreature = ko.observable();
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
        Encounter.Load = function (e, userPollQueue) {
            var encounter = new Encounter(userPollQueue);
            encounter.AddSavedEncounter(e);
            return encounter;
        };
        return Encounter;
    })();
    ImprovedInitiative.Encounter = Encounter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CreatureLibrary = (function () {
        function CreatureLibrary(creatures) {
            var _this = this;
            this.Creatures = ko.observableArray();
            this.Players = ko.observableArray();
            this.SavedEncounterIndex = ko.observableArray();
            this.ShowPreviewPane = function (creature, event) {
                _this.PreviewCreature(creature);
                //todo: move this code into some sort of AfterRender within the preview statblock so it resizes first.
                var popPosition = $(event.target).position().top;
                var maxPopPosition = $(document).height() - parseInt($('.preview.statblock').css('max-height'));
                if (popPosition > maxPopPosition) {
                    popPosition = maxPopPosition - 10;
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
                if (_this.DisplayTab() == 'Players') {
                    return _this.Players();
                }
                var filter = _this.LibraryFilter();
                if (filter.length == 0) {
                    return _this.Creatures();
                }
                var creaturesWithFilterInName = _this.Creatures().filter(function (v) {
                    return v.Name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
                });
                var creaturesWithFilterInType = _this.Creatures().filter(function (v) {
                    return v.Type && v.Type.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
                });
                return creaturesWithFilterInName.concat(creaturesWithFilterInType);
            });
            this.PreviewCreature = ko.observable();
            this.PreviewCreatureStatblock = ko.computed(function () {
                return _this.PreviewCreature() || ImprovedInitiative.StatBlock.Empty();
            });
            this.EditCreature = ko.observable();
            this.EditCreatureStatblock = ko.computed(function () {
                return _this.EditCreature() || ImprovedInitiative.StatBlock.Empty();
            });
            this.SaveCreature = function () {
                var creature = _this.EditCreature();
                if (_this.DisplayTab() == 'Creatures') {
                    _this.Creatures.splice(_this.Creatures.indexOf(creature), 1, creature);
                }
                else if (_this.DisplayTab() == 'Players') {
                    creature.Player = 'player';
                    _this.Players.splice(_this.Players.indexOf(creature), 1, creature);
                }
                _this.EditCreature(null);
            };
            this.AddNewPlayer = function () {
                var player = ImprovedInitiative.StatBlock.Empty();
                _this.EditCreature(player);
            };
            this.AddNewCreature = function () {
                var creature = ImprovedInitiative.StatBlock.Empty();
                _this.EditCreature(creature);
            };
            this.Creatures(creatures || []);
            var savedEncounterList = localStorage.getItem('ImprovedInitiative.SavedEncounters');
            if (savedEncounterList == 'undefined') {
                savedEncounterList = '[]';
            }
            JSON.parse(savedEncounterList).forEach(function (e) {
                _this.SavedEncounterIndex.push(e);
            });
        }
        CreatureLibrary.prototype.AddPlayers = function (library) {
            this.Players(this.Players().concat(library));
        };
        CreatureLibrary.prototype.AddCreatures = function (creatureOrLibrary) {
            if (creatureOrLibrary.length) {
                this.Creatures(this.Creatures()
                    .concat(creatureOrLibrary
                    .sort(function (a, b) {
                    return a.Name.toLocaleLowerCase() < b.Name.toLocaleLowerCase() ? -1 : 1;
                })));
            }
            else {
                this.Creatures().push(creatureOrLibrary);
            }
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
        StatBlock.Empty = function () { return ({
            Name: '', Type: '',
            HP: { Value: 1, Notes: '' }, AC: { Value: 10, Notes: '' },
            Speed: [],
            Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
            DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
            Saves: [], Skills: [], Senses: [], Languages: [],
            Challenge: '',
            Traits: [],
            Actions: [],
            LegendaryActions: []
        }); };
        StatBlock.AbilityNames = ["Str", "Dex", "Con", "Cha", "Int", "Wis"];
        return StatBlock;
    })();
    ImprovedInitiative.StatBlock = StatBlock;
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
        return args[n] || "{" + n + "}";
    });
};
/// <reference path="tracker.ts" />
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var UserPollQueue = (function () {
        function UserPollQueue() {
            var _this = this;
            this.Queue = ko.observableArray();
            this.Add = function (poll) {
                _this.Queue.push(poll);
            };
            this.Resolve = function (form) {
                var poll = _this.Queue.shift();
                poll.callback($(form).find(poll.inputSelector).val());
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
        }
        return UserPollQueue;
    })();
    ImprovedInitiative.UserPollQueue = UserPollQueue;
})(ImprovedInitiative || (ImprovedInitiative = {}));
/// <reference path="typings/requirejs/require.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />
/// <reference path="toolbox.ts" />
/// <reference path="custombindinghandlers.ts" />
/// <reference path="components.ts" />
/// <reference path="userpoll.ts" />
/// <reference path="statblock.ts" />
/// <reference path="creature.ts" />
/// <reference path="playercharacter.ts" />
/// <reference path="encounter.ts" />
/// <reference path="rules.ts" />
/// <reference path="library.ts" />
/// <reference path="libraryimporter.ts" />
var ImprovedInitiative;
(function (ImprovedInitiative) {
    ImprovedInitiative.uiText = {
        'LegendaryActions': 'Legendary Actions',
        'DamageVulnerabilities': 'Damage Vulnerabilities',
        'DamageResistances': 'Damage Resistances',
        'DamageImmunities': 'Damage Immunities',
        'ConditionImmunities': 'Condition Immunities'
    };
    var KeyBinding = (function () {
        function KeyBinding() {
        }
        return KeyBinding;
    })();
    var ViewModel = (function () {
        function ViewModel() {
            var _this = this;
            this.UserPollQueue = new ImprovedInitiative.UserPollQueue();
            this.Library = ko.observable(new ImprovedInitiative.CreatureLibrary());
            this.Encounter = ko.observable(new ImprovedInitiative.Encounter(this.UserPollQueue));
            this.SaveEncounter = function () {
                _this.UserPollQueue.Add({
                    requestContent: "<p>Save Encounter As: <input class='response' type='text' value='' /></p>",
                    inputSelector: '.response',
                    callback: function (response) {
                        var savedEncounter = _this.Encounter().Save(response);
                        var savedEncounters = _this.Library().SavedEncounterIndex;
                        savedEncounters().push(response);
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
                var encounter = ImprovedInitiative.Encounter.Load(JSON.parse(encounterJSON), _this.UserPollQueue);
                _this.Encounter(encounter);
                _this.RegisterKeybindings();
            };
            this.KeyBindings = [
                { Description: 'Show Keybindings', Combo: '?', GetBinding: function () { return _this.ToggleKeybindings; } },
                { Description: 'Select Next Combatant', Combo: 'j', GetBinding: function () { return _this.Encounter().SelectNextCombatant; } },
                { Description: 'Select Previous Combatant', Combo: 'k', GetBinding: function () { return _this.Encounter().SelectPreviousCombatant; } },
                { Description: 'Next Turn', Combo: 'n', GetBinding: function () { return _this.Encounter().NextTurn; } },
                { Description: 'Previous Turn', Combo: 'alt+n', GetBinding: function () { return _this.Encounter().PreviousTurn; } },
                { Description: 'Damage/Heal Selected Combatant', Combo: 't', GetBinding: function () { return _this.Encounter().FocusSelectedCreatureHP; } },
                { Description: 'Add Tag to Selected Combatant', Combo: 'g', GetBinding: function () { return _this.Encounter().AddSelectedCreatureTag; } },
                { Description: 'Remove Selected Combatant from Encounter', Combo: 'del', GetBinding: function () { return _this.Encounter().RemoveSelectedCreature; } },
                { Description: 'Rename Selected Combatant', Combo: 'f2', GetBinding: function () { return _this.Encounter().EditSelectedCreatureName; } },
                { Description: 'Roll Initiative', Combo: 'alt+r', GetBinding: function () { return _this.Encounter().RollInitiative; } },
                { Description: 'Move Selected Combatant Down', Combo: 'alt+j', GetBinding: function () { return _this.Encounter().MoveSelectedCreatureDown; } },
                { Description: 'Move Selected Combatant Up', Combo: 'alt+k', GetBinding: function () { return _this.Encounter().MoveSelectedCreatureUp; } },
                { Description: 'Add Temporary HP', Combo: 'alt+t', GetBinding: function () { return _this.Encounter().AddSelectedCreatureTemporaryHP; } },
                { Description: 'Save Encounter', Combo: 'alt+s', GetBinding: function () { return _this.SaveEncounter; } },
            ];
            this.ToggleKeybindings = function () {
                if ($('.keybindings').toggle().css('display') == 'none') {
                    _this.RegisterKeybindings();
                }
            };
        }
        ViewModel.prototype.RegisterKeybindings = function () {
            Mousetrap.reset();
            this.KeyBindings.forEach(function (b) { return Mousetrap.bind(b.Combo, b.GetBinding()); });
        };
        return ViewModel;
    })();
    ImprovedInitiative.ViewModel = ViewModel;
    $(function () {
        var viewModel = new ViewModel();
        viewModel.RegisterKeybindings();
        ko.applyBindings(viewModel);
        $.ajax("basic_rules_creatures.json").done(function (json) {
            viewModel.Library().AddCreatures(json);
        });
        $.ajax("playercharacters.json").done(function (json) {
            viewModel.Library().AddPlayers(json);
        });
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
