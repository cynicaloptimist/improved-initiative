var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CombatantPlayerViewModel = (function () {
        function CombatantPlayerViewModel(creature) {
            this.GetHPColor = function (creature) {
                var green = Math.floor((creature.CurrentHP() / creature.MaxHP) * 170);
                var red = Math.floor((creature.MaxHP - creature.CurrentHP()) / creature.MaxHP * 170);
                return "rgb(" + red + "," + green + ",0)";
            };
            this.Name = creature.ViewModel ? creature.ViewModel.DisplayName() :
                creature.StatBlock().Name;
            this.HPDisplay = this.GetHPDisplay(creature);
            this.HPColor = this.GetHPColor(creature);
            this.Initiative = creature.Initiative();
            this.IsPlayerCharacter = creature.IsPlayerCharacter;
            this.Tags = creature.Tags();
        }
        CombatantPlayerViewModel.prototype.GetHPDisplay = function (creature) {
            if (creature.IsPlayerCharacter) {
                if (creature.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(creature.CurrentHP(), creature.TemporaryHP(), creature.MaxHP);
                }
                else {
                    return '{0}/{1}'.format(creature.CurrentHP(), creature.MaxHP);
                }
            }
            if (creature.Encounter.Rules.EnemyHPTransparency == "whenBloodied") {
                if (creature.CurrentHP() <= 0) {
                    return "<span class='defeatedHP'>Defeated</span>";
                }
                else if (creature.CurrentHP() < creature.MaxHP / 2) {
                    return "<span class='bloodiedHP'>Bloodied</span>";
                }
                else if (creature.CurrentHP() < creature.MaxHP) {
                    return "<span class='hurtHP'>Hurt</span>";
                }
                return "<span class='healthyHP'>Healthy</span>";
            }
            else {
                if (creature.CurrentHP() <= 0) {
                    return "<span class='defeatedHP'>Defeated</span>";
                }
                return "<span class='healthyHP'>Healthy</span>";
            }
        };
        return CombatantPlayerViewModel;
    })();
    ImprovedInitiative.CombatantPlayerViewModel = CombatantPlayerViewModel;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CombatantViewModel = (function () {
        function CombatantViewModel(Creature, PollUser) {
            var _this = this;
            this.Creature = Creature;
            this.PollUser = PollUser;
            this.ApplyDamage = function (inputDamage) {
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
            this.ApplyTemporaryHP = function (inputTHP) {
                var newTemporaryHP = parseInt(inputTHP), currentTemporaryHP = _this.Creature.TemporaryHP();
                if (isNaN(newTemporaryHP)) {
                    return;
                }
                if (newTemporaryHP > currentTemporaryHP) {
                    currentTemporaryHP = newTemporaryHP;
                }
                _this.Creature.TemporaryHP(currentTemporaryHP);
            };
            this.ApplyInitiative = function (inputInitiative) {
                _this.Creature.Initiative(inputInitiative);
                _this.Creature.Encounter.SortByInitiative();
            };
            this.GetHPColor = function () {
                var green = Math.floor((_this.Creature.CurrentHP() / _this.Creature.MaxHP) * 170);
                var red = Math.floor((_this.Creature.MaxHP - _this.Creature.CurrentHP()) / _this.Creature.MaxHP * 170);
                return "rgb(" + red + "," + green + ",0)";
            };
            this.EditHP = function () {
                _this.PollUser({
                    requestContent: "Apply damage to " + _this.DisplayName() + " (" + _this.DisplayHP() + "): <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: function (damage) {
                        _this.ApplyDamage(damage);
                        _this.Creature.Encounter.QueueEmitEncounter();
                    }
                });
            };
            this.EditInitiative = function () {
                _this.PollUser({
                    requestContent: "Update initiative for " + _this.DisplayName() + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: function (initiative) {
                        _this.ApplyInitiative(initiative);
                        _this.Creature.Encounter.QueueEmitEncounter();
                    }
                });
            };
            this.EditName = function () {
                _this.PollUser({
                    requestContent: "Change alias for " + _this.DisplayName() + ": <input class='response' />",
                    inputSelector: '.response',
                    callback: function (alias) {
                        _this.Creature.Alias(alias);
                        _this.Creature.Encounter.QueueEmitEncounter();
                    }
                });
            };
            this.AddTemporaryHP = function () {
                _this.PollUser({
                    requestContent: "Grant temporary hit points to " + _this.DisplayName() + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: function (thp) {
                        _this.ApplyTemporaryHP(thp);
                        _this.Creature.Encounter.QueueEmitEncounter();
                    }
                });
            };
            this.HiddenClass = ko.computed(function () {
                return _this.Creature.Hidden() ? 'fa-eye-slash' : 'fa-eye';
            });
            this.ToggleHidden = function (data, event) {
                _this.Creature.Hidden(!_this.Creature.Hidden());
                _this.Creature.Encounter.QueueEmitEncounter();
            };
            this.DisplayName = ko.computed(function () {
                var alias = ko.unwrap(_this.Creature.Alias), name = ko.unwrap(_this.Creature.StatBlock).Name, creatureCount = ko.unwrap(_this.Creature.Encounter.CreatureCountsByName[name]), index = _this.Creature.IndexLabel;
                return alias ||
                    (creatureCount > 1 ?
                        name + " " + index :
                        name);
            });
            this.AddingTag = ko.observable(false);
            this.NewTag = ko.observable(null);
            this.CommitTag = function () {
                _this.Creature.Tags.push(_this.NewTag());
                _this.NewTag(null);
                _this.AddingTag(false);
                _this.Creature.Encounter.QueueEmitEncounter();
            };
            this.RemoveTag = function (tag) {
                _this.Creature.Tags.splice(_this.Creature.Tags.indexOf(tag), 1);
                _this.Creature.Encounter.QueueEmitEncounter();
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
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Command = (function () {
        function Command(Description, ActionBinding, KeyBinding, ActionBarIcon, showOnActionBar, LockOnActionBar) {
            var _this = this;
            if (KeyBinding === void 0) { KeyBinding = ''; }
            if (ActionBarIcon === void 0) { ActionBarIcon = ''; }
            if (showOnActionBar === void 0) { showOnActionBar = true; }
            if (LockOnActionBar === void 0) { LockOnActionBar = false; }
            this.Description = Description;
            this.ActionBinding = ActionBinding;
            this.KeyBinding = KeyBinding;
            this.ActionBarIcon = ActionBarIcon;
            this.LockOnActionBar = LockOnActionBar;
            this.ShowOnActionBar = ko.observable(showOnActionBar);
            if (LockOnActionBar) {
                this.ShowOnActionBar.subscribe(function (_) {
                    _this.ShowOnActionBar(true);
                });
            }
        }
        return Command;
    })();
    ImprovedInitiative.Command = Command;
    ImprovedInitiative.BuildCommandList = function (c) { return [
        new Command('Roll Initiative', c.RollInitiative, 'alt+r', 'fa-play'),
        new Command('Open Creature Library', c.ShowLibraries, 'alt+a', 'fa-user-plus'),
        new Command('Show Player Window', c.LaunchPlayerWindow, 'alt+w', 'fa-users'),
        new Command('Select Next Combatant', c.SelectNextCombatant, 'j', 'fa-arrow-down', false),
        new Command('Select Previous Combatant', c.SelectPreviousCombatant, 'k', 'fa-arrow-up', false),
        new Command('Next Turn', c.NextTurn, 'n', 'fa-step-forward'),
        new Command('Previous Turn', c.PreviousTurn, 'alt+n', 'fa-step-backward'),
        new Command('Damage/Heal Selected Combatant', c.FocusSelectedCreatureHP, 't', 'fa-plus-circle'),
        new Command('Add Note to Selected Combatant', c.AddSelectedCreatureTag, 'g', 'fa-tag', false),
        new Command('Remove Selected Combatant from Encounter', c.RemoveSelectedCreatures, 'del', 'fa-remove'),
        new Command('Rename Selected Combatant', c.EditSelectedCreatureName, 'f2', 'fa-i-cursor'),
        new Command('Edit Selected Combatant', c.EditSelectedCreatureStatBlock, 'alt+e', 'fa-edit', false),
        new Command('Edit Selected Combatant Initiative', c.EditSelectedCreatureInitiative, 'alt+i', 'fa-play-circle-o'),
        new Command('Move Selected Combatant Down', c.MoveSelectedCreatureDown, 'alt+j', 'fa-angle-double-down'),
        new Command('Move Selected Combatant Up', c.MoveSelectedCreatureUp, 'alt+k', 'fa-angle-double-up'),
        new Command('Apply Temporary HP', c.AddSelectedCreaturesTemporaryHP, 'alt+t', 'fa-medkit'),
        new Command('Save Encounter', c.SaveEncounter, 'alt+s', 'fa-save'),
        new Command('Settings', c.ShowSettings, '?', 'fa-gear', true, true)
    ]; };
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Commander = (function () {
        function Commander(encounter, userPollQueue, statBlockEditor, library) {
            var _this = this;
            this.encounter = encounter;
            this.userPollQueue = userPollQueue;
            this.statBlockEditor = statBlockEditor;
            this.library = library;
            this.SelectedCreatures = ko.observableArray([]);
            this.SelectedCreatureStatblock = ko.computed(function () {
                var selectedCreatures = _this.SelectedCreatures();
                if (selectedCreatures.length == 1) {
                    return selectedCreatures[0].StatBlock();
                }
                else {
                    return ImprovedInitiative.StatBlock.Empty();
                }
            });
            this.AddCreatureFromListing = function (listing, event) {
                listing.LoadStatBlock(function (listing) {
                    _this.encounter().AddCreature(listing.StatBlock(), event);
                });
            };
            this.deleteCreature = function (library, id) {
                ImprovedInitiative.Store.Delete(library, id);
                if (library == ImprovedInitiative.Store.PlayerCharacters) {
                    _this.library.Players.remove(function (c) { return c.Id == id; });
                }
                if (library == ImprovedInitiative.Store.Creatures) {
                    _this.library.Creatures.remove(function (c) { return c.Id == id; });
                }
            };
            this.saveCreature = function (store, statBlockId, newStatBlock) {
                var listing = new ImprovedInitiative.CreatureListing(statBlockId, newStatBlock.Name, newStatBlock.Type, null, "localStorage", newStatBlock);
                ImprovedInitiative.Store.Save(store, statBlockId, newStatBlock);
                if (store == ImprovedInitiative.Store.PlayerCharacters) {
                    _this.library.Players.unshift(listing);
                }
                else {
                    _this.library.Creatures.unshift(listing);
                }
            };
            this.CreateAndEditCreature = function (library) {
                var statBlock = ImprovedInitiative.StatBlock.Empty();
                if (library == "Players") {
                    statBlock.Name = "New Player Character";
                    statBlock.Player = "player";
                    var newId = _this.library.Players().length.toString();
                    _this.statBlockEditor.EditCreature(newId, statBlock, _this.saveCreature, _this.deleteCreature);
                }
                else {
                    statBlock.Name = "New Creature";
                }
            };
            this.SelectCreature = function (data, e) {
                if (!data) {
                    return;
                }
                if (!(e && e.ctrlKey)) {
                    _this.SelectedCreatures.removeAll();
                }
                _this.SelectedCreatures.push(data);
            };
            this.selectCreatureByOffset = function (offset) {
                var newIndex = _this.encounter().Creatures.indexOf(_this.SelectedCreatures()[0]) + offset;
                if (newIndex < 0) {
                    newIndex = 0;
                }
                else if (newIndex >= _this.encounter().Creatures().length) {
                    newIndex = _this.encounter().Creatures().length - 1;
                }
                _this.SelectedCreatures.removeAll();
                _this.SelectedCreatures.push(_this.encounter().Creatures()[newIndex]);
            };
            this.RemoveSelectedCreatures = function () {
                var creatures = _this.SelectedCreatures.removeAll(), index = _this.encounter().Creatures.indexOf(creatures[0]), deletedCreatureNames = creatures.map(function (c) { return c.StatBlock().Name; });
                _this.encounter().Creatures.removeAll(creatures);
                var allMyFriendsAreGone = function (name) { return _this.encounter().Creatures().every(function (c) { return c.StatBlock().Name != name; }); };
                deletedCreatureNames.forEach(function (name) {
                    if (allMyFriendsAreGone(name)) {
                        _this.encounter().CreatureCountsByName[name](0);
                    }
                });
                if (index >= _this.encounter().Creatures().length) {
                    index = _this.encounter().Creatures().length - 1;
                }
                _this.SelectCreature(_this.encounter().Creatures()[index]);
                _this.encounter().QueueEmitEncounter();
            };
            this.SelectPreviousCombatant = function () {
                _this.selectCreatureByOffset(-1);
            };
            this.SelectNextCombatant = function () {
                _this.selectCreatureByOffset(1);
            };
            this.FocusSelectedCreatureHP = function () {
                var selectedCreatures = _this.SelectedCreatures();
                var creatureNames = selectedCreatures.map(function (c) { return c.ViewModel.DisplayName(); }).join(', ');
                _this.userPollQueue.Add({
                    requestContent: "Apply damage to " + creatureNames + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: function (response) { return selectedCreatures.forEach(function (c) {
                        c.ViewModel.ApplyDamage(response);
                        _this.encounter().QueueEmitEncounter();
                    }); }
                });
                return false;
            };
            this.AddSelectedCreaturesTemporaryHP = function () {
                var selectedCreatures = _this.SelectedCreatures();
                var creatureNames = selectedCreatures.map(function (c) { return c.ViewModel.DisplayName(); }).join(', ');
                _this.userPollQueue.Add({
                    requestContent: "Grant temporary hit points to " + creatureNames + ": <input class='response' type='number' />",
                    inputSelector: '.response',
                    callback: function (response) { return selectedCreatures.forEach(function (c) {
                        c.ViewModel.ApplyTemporaryHP(response);
                        _this.encounter().QueueEmitEncounter();
                    }); }
                });
                return false;
            };
            this.AddSelectedCreatureTag = function () {
                _this.SelectedCreatures().forEach(function (c) { return c.ViewModel.AddingTag(true); });
                return false;
            };
            this.EditSelectedCreatureInitiative = function () {
                _this.SelectedCreatures().forEach(function (c) { return c.ViewModel.EditInitiative(); });
                return false;
            };
            this.MoveSelectedCreatureUp = function () {
                var creature = _this.SelectedCreatures()[0];
                var index = _this.encounter().Creatures.indexOf(creature);
                if (creature && index > 0) {
                    _this.encounter().MoveCreature(creature, index - 1);
                }
            };
            this.MoveSelectedCreatureDown = function () {
                var creature = _this.SelectedCreatures()[0];
                var index = _this.encounter().Creatures.indexOf(creature);
                if (creature && index < _this.encounter().Creatures().length - 1) {
                    _this.encounter().MoveCreature(creature, index + 1);
                }
            };
            this.EditSelectedCreatureName = function () {
                _this.SelectedCreatures().forEach(function (c) { return c.ViewModel.EditName(); });
                return false;
            };
            this.EditSelectedCreatureStatBlock = function () {
                if (_this.SelectedCreatures().length == 1) {
                    var selectedCreature = _this.SelectedCreatures()[0];
                    _this.statBlockEditor.EditCreature(null, _this.SelectedCreatureStatblock(), function (_, __, newStatBlock) {
                        selectedCreature.StatBlock(newStatBlock);
                        _this.encounter().QueueEmitEncounter();
                    }, function (library, id) {
                        _this.RemoveSelectedCreatures();
                    });
                }
            };
            this.FocusResponseRequest = function () {
                $('#user-response-requests input').first().select();
            };
            this.ShowLibraries = function () {
                $('.libraries').slideDown();
            };
            this.LaunchPlayerWindow = function () {
                window.open("/p/" + _this.encounter().EncounterId, 'Player View');
            };
            this.ShowSettings = function () {
                $('.modalblur').show();
                $('.settings').show();
            };
            this.HideSettings = function () {
                $('.modalblur').hide();
                $('.settings').hide();
                _this.RegisterKeyBindings();
                ImprovedInitiative.Store.Save(ImprovedInitiative.Store.User, 'SkipIntro', true);
            };
            this.RollInitiative = function () {
                _this.encounter().RollInitiative(_this.userPollQueue);
                _this.userPollQueue.Add({
                    callback: _this.encounter().StartEncounter
                });
            };
            this.NextTurn = function () {
                _this.encounter().NextTurn();
            };
            this.PreviousTurn = function () {
                _this.encounter().PreviousTurn();
            };
            this.SaveEncounter = function () {
                _this.userPollQueue.Add({
                    requestContent: "Save Encounter As: <input class='response' type='text' value='' />",
                    inputSelector: '.response',
                    callback: function (response) {
                        var savedEncounter = _this.encounter().Save(response);
                        var savedEncounters = _this.library.SavedEncounterIndex;
                        if (savedEncounters.indexOf(response) == -1) {
                            savedEncounters.push(response);
                        }
                        ImprovedInitiative.Store.Save(ImprovedInitiative.Store.SavedEncounters, response, savedEncounter);
                    }
                });
            };
            this.LoadEncounterByName = function (encounterName) {
                var encounter = ImprovedInitiative.Store.Load(ImprovedInitiative.Store.SavedEncounters, encounterName);
                _this.encounter().LoadSavedEncounter(encounter);
            };
            this.DeleteSavedEncounter = function (encounterName) {
                if (confirm("Delete saved encounter \"" + encounterName + "\"? This cannot be undone.")) {
                    ImprovedInitiative.Store.Delete(ImprovedInitiative.Store.SavedEncounters, encounterName);
                    _this.library.SavedEncounterIndex.remove(encounterName);
                }
            };
            this.Commands = ImprovedInitiative.BuildCommandList(this);
            this.Commands.forEach(function (c) {
                var keyBinding = ImprovedInitiative.Store.Load(ImprovedInitiative.Store.KeyBindings, c.Description);
                if (keyBinding) {
                    c.KeyBinding = keyBinding;
                }
                var showOnActionBar = ImprovedInitiative.Store.Load(ImprovedInitiative.Store.ActionBar, c.Description);
                if (showOnActionBar != null) {
                    c.ShowOnActionBar(showOnActionBar);
                }
            });
            if (ImprovedInitiative.Store.Load(ImprovedInitiative.Store.User, 'SkipIntro')) {
                this.HideSettings();
            }
        }
        Commander.prototype.RegisterKeyBindings = function () {
            Mousetrap.reset();
            this.Commands.forEach(function (b) {
                Mousetrap.bind(b.KeyBinding, b.ActionBinding);
                ImprovedInitiative.Store.Save(ImprovedInitiative.Store.KeyBindings, b.Description, b.KeyBinding);
                ImprovedInitiative.Store.Save(ImprovedInitiative.Store.ActionBar, b.Description, b.ShowOnActionBar());
            });
        };
        return Commander;
    })();
    ImprovedInitiative.Commander = Commander;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var templateLoader = {
        loadTemplate: function (name, templateConfig, callback) {
            if (templateConfig.name) {
                var fullUrl = '/templates/' + templateConfig.name;
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
    ko.components.register('settings', {
        viewModel: function (params) {
            return {
                Commander: params.commander,
                ShowTab: function (tabSelector) {
                    $('.settings .tab').hide();
                    $(".settings " + tabSelector).show();
                },
                ExportData: function () {
                    var blob = ImprovedInitiative.Store.ExportAll();
                    saveAs(blob, 'improved-initiative.json');
                },
                ImportData: function (_, event) {
                    var file = event.target.files[0];
                    if (file) {
                        ImprovedInitiative.Store.ImportAll(file);
                    }
                }
            };
        },
        template: { name: 'settings' }
    });
    ko.components.register('defaultstatblock', {
        viewModel: function (params) { return params.creature; },
        template: { name: 'defaultstatblock' }
    });
    ko.components.register('activestatblock', {
        viewModel: function (params) { return params.creature; },
        template: { name: 'activestatblock' }
    });
    ko.components.register('combatant', {
        viewModel: function (params) {
            params.creature.ViewModel = new ImprovedInitiative.CombatantViewModel(params.creature, params.addUserPoll);
            return params.creature.ViewModel;
        },
        template: { name: 'combatant' }
    });
    ko.components.register('playerdisplaycombatant', {
        viewModel: function (params) { return params.creature; },
        template: { name: 'playerdisplaycombatant' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Creature = (function () {
        function Creature(creatureJson, Encounter) {
            var _this = this;
            this.Encounter = Encounter;
            this.Alias = ko.observable(null);
            this.TemporaryHP = ko.observable(0);
            this.Tags = ko.observableArray();
            this.Initiative = ko.observable(0);
            this.StatBlock = ko.observable();
            this.Hidden = ko.observable(false);
            this.IsPlayerCharacter = false;
            this.calculateModifiers = function () {
                var modifiers = ImprovedInitiative.StatBlock.Empty().Abilities;
                for (var attribute in _this.StatBlock().Abilities) {
                    modifiers[attribute] = _this.Encounter.Rules.Modifier(_this.StatBlock().Abilities[attribute]);
                }
                return modifiers;
            };
            this.RollInitiative = function (userPollQueue) {
                var roll = _this.Encounter.Rules.Check(_this.InitiativeModifier);
                _this.Initiative(roll);
                return roll;
            };
            var statBlock = jQuery.extend(ImprovedInitiative.StatBlock.Empty(), creatureJson);
            this.StatBlock(statBlock);
            this.processStatBlock(statBlock);
            this.StatBlock.subscribe(function (newStatBlock) {
                _this.processStatBlock(newStatBlock, statBlock);
                statBlock = newStatBlock;
            });
            this.CurrentHP = ko.observable(statBlock.HP.Value);
        }
        Creature.prototype.processStatBlock = function (newStatBlock, oldStatBlock) {
            this.setIndexLabel(oldStatBlock && oldStatBlock.Name);
            this.AC = newStatBlock.AC.Value;
            this.MaxHP = newStatBlock.HP.Value;
            this.AbilityModifiers = this.calculateModifiers();
            this.InitiativeModifier = newStatBlock.InitiativeModifier || this.AbilityModifiers.Dex || 0;
        };
        Creature.prototype.setIndexLabel = function (oldName) {
            var name = this.StatBlock().Name, counts = this.Encounter.CreatureCountsByName;
            if (name == oldName) {
                return;
            }
            if (oldName) {
                counts[oldName](counts[oldName]() - 1);
            }
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
            if (ImprovedInitiative.TextAssets[valueAccessor()]) {
                $(element).html(ImprovedInitiative.TextAssets[valueAccessor()]);
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
    ko.bindingHandlers.hoverPop = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
            var params = valueAccessor();
            var componentSelector = params.selector;
            var popComponent = $(componentSelector).first();
            popComponent.hide();
            $(element).on('mouseover', function (event) {
                var hoveredElementData = ko.dataFor(event.target);
                params.data(hoveredElementData);
                var popPosition = $(event.target).position().top;
                var maxPopPosition = $(document).height() - popComponent.height();
                if (popPosition > maxPopPosition) {
                    popPosition = maxPopPosition;
                }
                popComponent.css('top', popPosition).select();
            });
            popComponent.add(element).hover(function () { popComponent.show(); }, function () { popComponent.hide(); });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Encounter = (function () {
        function Encounter(rules) {
            var _this = this;
            this.State = ko.observable('inactive');
            this.EncounterId = $('html')[0].getAttribute('encounterId');
            this.Socket = io();
            this.SortByInitiative = function () {
                _this.Creatures.sort(function (l, r) { return (r.Initiative() - l.Initiative()) ||
                    (r.InitiativeModifier - l.InitiativeModifier); });
                _this.QueueEmitEncounter();
            };
            this.EmitEncounter = function () {
                _this.Socket.emit('update encounter', _this.EncounterId, _this.SavePlayerDisplay());
            };
            this.QueueEmitEncounter = function () {
                clearTimeout(_this.emitEncounterTimeoutID);
                _this.emitEncounterTimeoutID = setTimeout(_this.EmitEncounter, 10);
            };
            this.MoveCreature = function (creature, index) {
                var currentPosition = _this.Creatures().indexOf(creature);
                var newInitiative = creature.Initiative();
                var passedCreature = _this.Creatures()[index];
                if (index > currentPosition && passedCreature && passedCreature.Initiative() < creature.Initiative()) {
                    newInitiative = passedCreature.Initiative();
                }
                if (index < currentPosition && passedCreature && passedCreature.Initiative() > creature.Initiative()) {
                    newInitiative = passedCreature.Initiative();
                }
                _this.Creatures.remove(creature);
                _this.Creatures.splice(index, 0, creature);
                creature.Initiative(newInitiative);
                _this.QueueEmitEncounter();
            };
            this.loadCreature = function (savedCreature) {
                var creature = _this.AddCreature(savedCreature.Statblock);
                creature.CurrentHP(savedCreature.CurrentHP);
                creature.TemporaryHP(savedCreature.TemporaryHP);
                creature.Initiative(savedCreature.Initiative);
                creature.IndexLabel = savedCreature.IndexLabel;
                creature.Alias(savedCreature.Alias);
                creature.Tags(savedCreature.Tags);
                creature.Hidden(savedCreature.Hidden);
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
                _this.QueueEmitEncounter();
                return creature;
            };
            this.RequestInitiative = function (playercharacter, userPollQueue) {
                userPollQueue.Add({
                    requestContent: "Initiative Roll for " + playercharacter.ViewModel.DisplayName() + " (" + playercharacter.InitiativeModifier.toModifierString() + "): <input class='response' type='number' value='" + _this.Rules.Check(playercharacter.InitiativeModifier) + "' />",
                    inputSelector: '.response',
                    callback: function (response) {
                        playercharacter.Initiative(parseInt(response));
                    }
                });
            };
            this.StartEncounter = function () {
                _this.SortByInitiative();
                _this.State('active');
                _this.ActiveCreature(_this.Creatures()[0]);
                _this.QueueEmitEncounter();
            };
            this.EndEncounter = function () {
                _this.State('inactive');
                _this.ActiveCreature(null);
                _this.QueueEmitEncounter();
            };
            this.RollInitiative = function (userPollQueue) {
                // Foreaching over the original array while we're rearranging it
                // causes unpredictable results- dupe it first.
                var creatures = _this.Creatures().slice();
                if (_this.Rules.GroupSimilarCreatures) {
                    var initiatives = [];
                    creatures.forEach(function (c) {
                        if (initiatives[c.StatBlock().Name] === undefined) {
                            initiatives[c.StatBlock().Name] = c.RollInitiative(userPollQueue);
                        }
                        c.Initiative(initiatives[c.StatBlock().Name]);
                    });
                }
                else {
                    creatures.forEach(function (c) {
                        c.RollInitiative(userPollQueue);
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
                _this.QueueEmitEncounter();
            };
            this.PreviousTurn = function () {
                var previousIndex = _this.Creatures().indexOf(_this.ActiveCreature()) - 1;
                if (previousIndex < 0) {
                    previousIndex = _this.Creatures().length - 1;
                }
                _this.ActiveCreature(_this.Creatures()[previousIndex]);
                _this.QueueEmitEncounter();
            };
            this.Save = function (name) {
                return {
                    Name: name || _this.EncounterId,
                    ActiveCreatureIndex: _this.Creatures().indexOf(_this.ActiveCreature()),
                    Creatures: _this.Creatures().map(function (c) {
                        return {
                            Statblock: c.StatBlock(),
                            CurrentHP: c.CurrentHP(),
                            TemporaryHP: c.TemporaryHP(),
                            Initiative: c.Initiative(),
                            Alias: c.Alias(),
                            IndexLabel: c.IndexLabel,
                            Tags: c.Tags(),
                            Hidden: c.Hidden()
                        };
                    })
                };
            };
            this.SavePlayerDisplay = function (name) {
                return {
                    Name: name || _this.EncounterId,
                    ActiveCreatureIndex: _this.Creatures().indexOf(_this.ActiveCreature()),
                    Creatures: _this.Creatures()
                        .filter(function (c) {
                        return c.Hidden() == false;
                    })
                        .map(function (c) { return new ImprovedInitiative.CombatantPlayerViewModel(c); })
                };
            };
            this.AddSavedEncounter = function (e) {
                e.Creatures.forEach(_this.loadCreature);
            };
            this.LoadSavedEncounter = function (e) {
                _this.Creatures.removeAll();
                _this.CreatureCountsByName = [];
                e.Creatures.forEach(_this.loadCreature);
                if (e.ActiveCreatureIndex != -1) {
                    _this.State('active');
                    _this.ActiveCreature(_this.Creatures()[e.ActiveCreatureIndex]);
                }
            };
            this.Rules = rules || new ImprovedInitiative.DefaultRules();
            this.Creatures = ko.observableArray();
            this.CreatureCountsByName = [];
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
    var CreatureListing = (function () {
        function CreatureListing(Id, name, Type, Link, Source, statblock) {
            var _this = this;
            this.Id = Id;
            this.Type = Type;
            this.Link = Link;
            this.Source = Source;
            this.LoadStatBlock = function (callback) {
                if (_this.IsLoaded) {
                    callback(_this);
                }
                else {
                    $.getJSON(_this.Link, function (json) {
                        _this.IsLoaded = true;
                        _this.StatBlock($.extend(ImprovedInitiative.StatBlock.Empty(), json));
                        callback(_this);
                    });
                }
            };
            this.Name = ko.observable(name);
            this.IsLoaded = !!statblock;
            this.StatBlock = ko.observable(statblock || ImprovedInitiative.StatBlock.Empty(function (c) { c.Name = name; }));
        }
        return CreatureListing;
    })();
    ImprovedInitiative.CreatureListing = CreatureListing;
    var CreatureLibrary = (function () {
        function CreatureLibrary() {
            var _this = this;
            this.previewStatBlock = ko.observable(null);
            this.Creatures = ko.observableArray([]);
            this.Players = ko.observableArray([]);
            this.SavedEncounterIndex = ko.observableArray([]);
            this.GetPreviewStatBlock = ko.computed(function () {
                return _this.previewStatBlock() || ImprovedInitiative.StatBlock.Empty();
            });
            this.PreviewCreature = function (creature) {
                _this.previewStatBlock(null);
                creature.LoadStatBlock(function (listing) {
                    _this.previewStatBlock(listing.StatBlock());
                });
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
                    if (c.Name().toLocaleLowerCase().indexOf(filter) > -1) {
                        creaturesWithFilterInName.push(c);
                        return;
                    }
                    if (c.Type.toLocaleLowerCase().indexOf(filter) > -1) {
                        creaturesWithFilterInType.push(c);
                    }
                });
                return creaturesWithFilterInName.concat(creaturesWithFilterInType);
            });
            this.AddCreaturesFromServer = function (library) {
                library.sort(function (c1, c2) {
                    return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
                });
                ko.utils.arrayPushAll(_this.Creatures, library.map(function (c) {
                    return new CreatureListing(c.Id, c.Name, c.Type, c.Link, "server");
                }));
            };
            ImprovedInitiative.Store.List(ImprovedInitiative.Store.SavedEncounters).forEach(function (e) { return _this.SavedEncounterIndex.push(e); });
            ImprovedInitiative.Store.List(ImprovedInitiative.Store.PlayerCharacters).forEach(function (id) {
                var statBlock = ImprovedInitiative.Store.Load(ImprovedInitiative.Store.PlayerCharacters, id);
                _this.Players.push(new CreatureListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });
            ImprovedInitiative.Store.List(ImprovedInitiative.Store.Creatures).forEach(function (id) {
                var statBlock = ImprovedInitiative.Store.Load(ImprovedInitiative.Store.PlayerCharacters, id);
                _this.Creatures.push(new CreatureListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });
        }
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var PlayerCharacter = (function (_super) {
        __extends(PlayerCharacter, _super);
        function PlayerCharacter() {
            var _this = this;
            _super.apply(this, arguments);
            this.IsPlayerCharacter = true;
            this.RollInitiative = function (userPollQueue) {
                _this.Encounter.RequestInitiative(_this, userPollQueue);
                return _this.Encounter.Rules.Check(_this.InitiativeModifier);
            };
        }
        return PlayerCharacter;
    })(ImprovedInitiative.Creature);
    ImprovedInitiative.PlayerCharacter = PlayerCharacter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var PlayerViewModel = (function () {
        function PlayerViewModel() {
            var _this = this;
            this.Creatures = ko.observableArray([]);
            this.ActiveCreature = ko.observable();
            this.EncounterId = $('html')[0].getAttribute('encounterId');
            this.Socket = io();
            this.LoadEncounter = function (encounter) {
                _this.Creatures(encounter.Creatures);
                if (encounter.ActiveCreatureIndex != -1) {
                    _this.ActiveCreature(_this.Creatures()[encounter.ActiveCreatureIndex]);
                }
            };
            this.LoadEncounterFromServer = function (encounterId) {
                $.ajax("../playerviews/" + encounterId).done(_this.LoadEncounter);
            };
            this.Socket.on('update encounter', function (encounter) {
                _this.LoadEncounter(encounter);
            });
            this.Socket.emit('join encounter', this.EncounterId);
        }
        return PlayerViewModel;
    })();
    ImprovedInitiative.PlayerViewModel = PlayerViewModel;
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
    ImprovedInitiative.SimplifyStatBlock = function (statBlock) {
        return {
            Abilities: statBlock.Abilities,
            AC: statBlock.AC,
            Actions: [],
            Challenge: statBlock.Challenge,
            ConditionImmunities: [],
            DamageImmunities: [],
            DamageResistances: [],
            DamageVulnerabilities: [],
            HP: statBlock.HP,
            InitiativeModifier: statBlock.InitiativeModifier,
            Languages: [],
            LegendaryActions: [],
            Saves: [],
            Senses: [],
            Skills: [],
            Speed: statBlock.Speed,
            Name: statBlock.Name,
            Player: statBlock.Player,
            Traits: [],
            Type: statBlock.Type
        };
    };
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var StatBlockEditor = (function () {
        function StatBlockEditor() {
            var _this = this;
            this.StatBlock = ko.observable();
            this.editorType = ko.observable('basic');
            this.statBlockJson = ko.observable();
            this.EditCreature = function (statBlockId, statBlock, saveCallback, deleteCallback) {
                _this.statBlockId = statBlockId;
                _this.StatBlock(statBlock);
                _this.statBlockJson(JSON.stringify(statBlock, null, 2));
                _this.saveCallback = saveCallback;
                _this.deleteCallback = deleteCallback;
            };
            this.SaveCreature = function () {
                if (_this.editorType() === 'advanced') {
                    try {
                        var statBlockFromJSON = JSON.parse(_this.statBlockJson());
                    }
                    catch (error) {
                        alert("Couldn't parse JSON from advanced editor.");
                        return;
                    }
                    _this.StatBlock($.extend(ImprovedInitiative.StatBlock.Empty(), statBlockFromJSON));
                }
                var editedStatBlock = _this.StatBlock();
                if (_this.editorType() === 'basic') {
                    editedStatBlock.HP.Value = _this.parseInt(editedStatBlock.HP.Value, 1);
                    editedStatBlock.AC.Value = _this.parseInt(editedStatBlock.AC.Value, 10);
                    editedStatBlock.Abilities.Dex = _this.parseInt(editedStatBlock.Abilities.Dex, 10);
                }
                _this.saveCallback(_this.statBlockLibrary(), _this.statBlockId, editedStatBlock);
                _this.StatBlock(null);
            };
            this.DeleteCreature = function () {
                var statBlock = _this.StatBlock();
                if (confirm("Delete statblock for " + statBlock.Name + "? This cannot be undone.")) {
                    _this.deleteCallback(_this.statBlockLibrary(), _this.statBlockId);
                    _this.StatBlock(null);
                }
            };
            this.parseInt = function (value, defaultValue) {
                if (defaultValue === void 0) { defaultValue = null; }
                if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
                    return Number(value);
                if (defaultValue !== null)
                    return defaultValue;
                return NaN;
            };
        }
        StatBlockEditor.prototype.statBlockLibrary = function () {
            return this.StatBlock().Player == 'player' ? ImprovedInitiative.Store.PlayerCharacters : ImprovedInitiative.Store.Creatures;
        };
        return StatBlockEditor;
    })();
    ImprovedInitiative.StatBlockEditor = StatBlockEditor;
    ko.components.register('editstatblock', {
        viewModel: function (params) { return params.editor; },
        template: { name: 'editstatblock' }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var Store = (function () {
        function Store() {
        }
        Store.List = function (listName) {
            var listKey = Store._prefix + "." + listName;
            var list = Store.load(listKey);
            if (list && list.constructor === Array) {
                return list;
            }
            Store.save(listKey, []);
            return [];
        };
        Store.Save = function (listName, key, value) {
            if (typeof (key) !== "string") {
                throw "Can't save to non-string key " + key;
            }
            var listKey = Store._prefix + "." + listName;
            var fullKey = Store._prefix + "." + listName + "." + key;
            var list = Store.List(listName);
            if (list.indexOf(key) == -1) {
                list.push(key);
                Store.save(listKey, list);
            }
            Store.save(fullKey, value);
        };
        Store.Load = function (listName, key) {
            var fullKey = Store._prefix + "." + listName + "." + key;
            return Store.load(fullKey);
        };
        Store.Delete = function (listName, key) {
            var listKey = Store._prefix + "." + listName;
            var fullKey = Store._prefix + "." + listName + "." + key;
            var list = Store.List(listName);
            var keyIndex = list.indexOf(key);
            if (keyIndex != -1) {
                list.splice(keyIndex, 1);
                Store.save(listKey, list);
            }
            localStorage.removeItem(fullKey);
        };
        Store.ExportAll = function () {
            return new Blob([JSON.stringify(localStorage, null, 2)], { type: 'application/json' });
        };
        Store.ImportAll = function (file) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var json = event.target.result;
                try {
                    var importedStorage = JSON.parse(json);
                }
                catch (error) {
                    alert("There was a problem importing " + file.name + ": " + error);
                    return;
                }
                if (confirm("Replace your Improved Initiative data with imported " + file.name + " and reload?")) {
                    localStorage.clear();
                    for (var key in importedStorage) {
                        localStorage.setItem(key, importedStorage[key]);
                    }
                    location.reload();
                }
            };
            reader.readAsText(file);
        };
        Store._prefix = "ImprovedInitiative";
        Store.PlayerCharacters = "PlayerCharacters";
        Store.Creatures = "Creatures";
        Store.SavedEncounters = "SavedEncounters";
        Store.User = "User";
        Store.KeyBindings = "KeyBindings";
        Store.ActionBar = "ActionBar";
        Store.save = function (key, value) { return localStorage.setItem(key, JSON.stringify(value)); };
        Store.load = function (key) {
            var value = localStorage.getItem(key);
            if (value === "undefined") {
                return null;
            }
            return JSON.parse(value);
        };
        return Store;
    })();
    ImprovedInitiative.Store = Store;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    ImprovedInitiative.TextAssets = {
        'LegendaryActions': 'Legendary Actions',
        'DamageVulnerabilities': 'Damage Vulnerabilities',
        'DamageResistances': 'Damage Resistances',
        'DamageImmunities': 'Damage Immunities',
        'ConditionImmunities': 'Condition Immunities'
    };
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
Function.prototype.with = function () {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i - 0] = arguments[_i];
    }
    if (typeof this !== "function") {
        throw new TypeError("Function.prototype.with needs to be called on a function");
    }
    var slice = Array.prototype.slice, args = slice.call(arguments), fn = this, partial = function () {
        return fn.apply(this, args.concat(slice.call(arguments)));
    };
    partial.prototype = Object.create(this.prototype);
    return partial;
};
var PostJSON = function (url, data, success) {
    return $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        success: success,
        dataType: "json",
        contentType: "application/json"
    });
};
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="../typings/socket.io-client/socket.io-client.d.ts" />
/// <reference path="../typings/FileSaver/FileSaver.d.ts" />
var ImprovedInitiative;
(function (ImprovedInitiative) {
    $(function () {
        if ($('#tracker').length) {
            var viewModel = new ImprovedInitiative.TrackerViewModel();
            viewModel.Commander.RegisterKeyBindings();
            ko.applyBindings(viewModel, document.body);
            $.ajax("../creatures/").done(viewModel.Library.AddCreaturesFromServer);
        }
        if ($('#playerview').length) {
            var encounterId = $('html')[0].getAttribute('encounterId');
            var playerViewModel = new ImprovedInitiative.PlayerViewModel();
            playerViewModel.LoadEncounterFromServer(encounterId);
            ko.applyBindings(playerViewModel, document.body);
        }
    });
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var TrackerViewModel = (function () {
        function TrackerViewModel() {
            this.UserPollQueue = new ImprovedInitiative.UserPollQueue();
            this.StatBlockEditor = new ImprovedInitiative.StatBlockEditor();
            this.Encounter = ko.observable(new ImprovedInitiative.Encounter());
            this.Library = new ImprovedInitiative.CreatureLibrary();
            this.Commander = new ImprovedInitiative.Commander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.Library);
        }
        return TrackerViewModel;
    })();
    ImprovedInitiative.TrackerViewModel = TrackerViewModel;
})(ImprovedInitiative || (ImprovedInitiative = {}));
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var UserPollQueue = (function () {
        function UserPollQueue() {
            var _this = this;
            this.queue = ko.observableArray();
            this.Add = function (poll) {
                _this.queue.push(poll);
            };
            this.Resolve = function (form) {
                var poll = _this.queue()[0];
                poll.callback($(form).find(poll.inputSelector).val());
                _this.queue.shift();
                return false;
            };
            this.HasPoll = ko.pureComputed(function () {
                return _this.queue().length > 0;
            });
            this.Message = ko.pureComputed(function () {
                return _this.queue()[0].requestContent + "<button type='submit'><span class='fa fa-check'></span></button>";
            });
            this.InputSelector = ko.pureComputed(function () {
                return _this.queue()[0].inputSelector;
            }).extend({ notify: 'always' });
            this.checkForAutoResolve = function () {
                var poll = _this.queue()[0];
                if (poll && !poll.requestContent) {
                    poll.callback(null);
                    _this.queue.shift();
                }
            };
            this.queue.subscribe(this.checkForAutoResolve);
        }
        return UserPollQueue;
    })();
    ImprovedInitiative.UserPollQueue = UserPollQueue;
})(ImprovedInitiative || (ImprovedInitiative = {}));
//# sourceMappingURL=ImprovedInitiative.js.map