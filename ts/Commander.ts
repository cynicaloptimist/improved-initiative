module ImprovedInitiative {
    export class Commander {
        Commands: Command[];
        SelectedCreatures: KnockoutObservableArray<ICreature> = ko.observableArray<ICreature>([]);

        constructor(private encounter: KnockoutObservable<Encounter>,
            private userPollQueue: UserPollQueue,
            private statBlockEditor: StatBlockEditor,
            private library: CreatureLibrary) {
            this.Commands = BuildCommandList(this);
            this.Commands.forEach(c => {
                var keyBinding = Store.Load<string>(Store.KeyBindings, c.Description);
                if (keyBinding) {
                    c.KeyBinding = keyBinding;
                }
                var showOnActionBar = Store.Load<boolean>(Store.ActionBar, c.Description);
                if (showOnActionBar != null) {
                    c.ShowOnActionBar(showOnActionBar);
                }
            })
            if (Store.Load(Store.User, 'SkipIntro')) {
                this.HideSettings();
            }
        }

        SelectedCreatureStatblock: KnockoutComputed<IStatBlock> = ko.computed(() => {
            var selectedCreatures = this.SelectedCreatures();
            if (selectedCreatures.length == 1) {
                return selectedCreatures[0].StatBlock();
            } else {
                return StatBlock.Empty();
            }
        });

        AddCreatureFromListing = (listing: CreatureListing, event?) => {
            listing.LoadStatBlock(listing => {
                this.encounter().AddCreature(listing.StatBlock(), event);
            });
        }

        private deleteSavedCreature = (library: string, id: string) => {
            Store.Delete(library, id);
            if (library == Store.PlayerCharacters) {
                this.library.Players.remove(c => c.Id == id);
            }
            if (library == Store.Creatures) {
                this.library.Creatures.remove(c => c.Id == id);
            }
        }

        private saveNewCreature = (store: string, statBlockId: string, newStatBlock: IStatBlock) => {
            var listing = new CreatureListing(statBlockId, newStatBlock.Name, newStatBlock.Type, null, "localStorage", newStatBlock);
            Store.Save<IStatBlock>(store, statBlockId, newStatBlock);
            if (store == Store.PlayerCharacters) {
                this.library.Players.unshift(listing);
            } else {
                this.library.Creatures.unshift(listing);
            }
        }
        
        CreateAndEditCreature = (library: string) => {
            var statBlock = StatBlock.Empty();
            if (library == "Players") {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                var newId = this.library.Players().length.toString();
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            } else {
                statBlock.Name = "New Creature";
                var newId = this.library.Creatures().length.toString();
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            }
        }
        
        private duplicateAndEditCreature = (listing: CreatureListing) => {
            var statBlock = listing.StatBlock();
            if (statBlock.Player == "player") {
                var newId = this.library.Players().length.toString();
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            } else {
                var newId = this.library.Creatures().length.toString();
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            }
        }
        
        EditCreature = (listing: CreatureListing) => {
            if (listing.Source == "server") {
                listing.LoadStatBlock(this.duplicateAndEditCreature);
            } else {
                this.statBlockEditor.EditCreature(listing.Id, listing.StatBlock(), (store: string, statBlockId: string, newStatBlock: IStatBlock) => {
                    Store.Save<IStatBlock>(store, statBlockId, newStatBlock);
                    listing.StatBlock(newStatBlock);
                }, this.deleteSavedCreature);
            }
        }

        SelectCreature = (data: ICreature, e?: MouseEvent) => {
            if (!data) {
                return;
            }
            if (!(e && e.ctrlKey)) {
                this.SelectedCreatures.removeAll();
            }
            this.SelectedCreatures.push(data);
        }

        private selectCreatureByOffset = (offset: number) => {
            var newIndex = this.encounter().Creatures.indexOf(this.SelectedCreatures()[0]) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            } else if (newIndex >= this.encounter().Creatures().length) {
                newIndex = this.encounter().Creatures().length - 1;
            }
            this.SelectedCreatures.removeAll()
            this.SelectedCreatures.push(this.encounter().Creatures()[newIndex]);
        }

        RemoveSelectedCreatures = () => {
            var creaturesToRemove = this.SelectedCreatures.removeAll(),
                indexOfFirstCreatureToRemove = this.encounter().Creatures.indexOf(creaturesToRemove[0]),
                deletedCreatureNames = creaturesToRemove.map(c => c.StatBlock().Name);
            
            if (this.encounter().Creatures().length > creaturesToRemove.length) {
                while (creaturesToRemove.indexOf(this.encounter().ActiveCreature()) > -1) {
                    this.encounter().NextTurn();
                }
            }

            this.encounter().Creatures.removeAll(creaturesToRemove);

            var allMyFriendsAreGone = name => this.encounter().Creatures().every(c => c.StatBlock().Name != name);

            deletedCreatureNames.forEach(name => {
                if (allMyFriendsAreGone(name)) {
                    this.encounter().CreatureCountsByName[name](0);
                }
            });

            if (indexOfFirstCreatureToRemove >= this.encounter().Creatures().length) {
                indexOfFirstCreatureToRemove = this.encounter().Creatures().length - 1;
            }
            this.SelectCreature(this.encounter().Creatures()[indexOfFirstCreatureToRemove])

            this.encounter().QueueEmitEncounter();
        }

        SelectPreviousCombatant = () => {
            this.selectCreatureByOffset(-1);
        }

        SelectNextCombatant = () => {
            this.selectCreatureByOffset(1);
        }

        FocusSelectedCreatureHP = () => {
            var selectedCreatures = this.SelectedCreatures();
            var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
            this.userPollQueue.Add({
                requestContent: `Apply damage to ${creatureNames}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: response => selectedCreatures.forEach(c => {
                    c.ViewModel.ApplyDamage(response);
                    this.encounter().QueueEmitEncounter();
                })
            });
            return false;
        }

        AddSelectedCreaturesTemporaryHP = () => {
            var selectedCreatures = this.SelectedCreatures();
            var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
            this.userPollQueue.Add({
                requestContent: `Grant temporary hit points to ${creatureNames}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: response => selectedCreatures.forEach(c => {
                    c.ViewModel.ApplyTemporaryHP(response);
                    this.encounter().QueueEmitEncounter();
                })
            });
            return false;
        }

        AddSelectedCreatureTag = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.AddingTag(true))
            return false;
        }

        EditSelectedCreatureInitiative = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.EditInitiative())
            return false;
        }

        MoveSelectedCreatureUp = () => {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter().Creatures.indexOf(creature)
            if (creature && index > 0) {
                this.encounter().MoveCreature(creature, index - 1);
            }
        }

        MoveSelectedCreatureDown = () => {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter().Creatures.indexOf(creature)
            if (creature && index < this.encounter().Creatures().length - 1) {
                this.encounter().MoveCreature(creature, index + 1);
            }
        }

        EditSelectedCreatureName = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.EditName())
            return false;
        }

        EditSelectedCreatureStatBlock = () => {
            if (this.SelectedCreatures().length == 1) {
                var selectedCreature = this.SelectedCreatures()[0];
                this.statBlockEditor.EditCreature(null, this.SelectedCreatureStatblock(), (_, __, newStatBlock) => {
                    selectedCreature.StatBlock(newStatBlock);
                    this.encounter().QueueEmitEncounter();
                }, (library, id) => {
                    this.RemoveSelectedCreatures();
                })
            }
        }

        FocusResponseRequest = () => {
            $('#user-poll input').first().select();
        }

        ShowingLibraries = ko.observable(true);
        ShowLibraries = () => this.ShowingLibraries(true);
        HideLibraries = () => this.ShowingLibraries(false);
        
        LaunchPlayerWindow = () => {
            window.open(`/p/${this.encounter().EncounterId}`, 'Player View');
        }

        ShowSettings = () => {
            $('.modalcontainer').show();
        }

        HideSettings = () => {
            $('.modalcontainer').hide();
            this.RegisterKeyBindings();
            Store.Save(Store.User, 'SkipIntro', true);
        }

        DisplayRoundCounter = ko.observable(Store.Load(Store.User, 'DisplayRoundCounter'))
        
        RegisterKeyBindings() {
            Mousetrap.reset();
            this.Commands.forEach(b => {
                Mousetrap.bind(b.KeyBinding, b.ActionBinding);
                Store.Save<string>(Store.KeyBindings, b.Description, b.KeyBinding);
                Store.Save<boolean>(Store.ActionBar, b.Description, b.ShowOnActionBar());
            })
        }

        RollInitiative = () => {
            this.encounter().RollInitiative(this.userPollQueue);
            this.userPollQueue.Add({
                callback: this.encounter().StartEncounter
            });
            this.HideLibraries();
        }

        NextTurn = () => {
            this.encounter().NextTurn();
        }

        PreviousTurn = () => {
            this.encounter().PreviousTurn();
        }
        SaveEncounter = () => {
            this.userPollQueue.Add({
                requestContent: `Save Encounter As: <input class='response' type='text' value='' />`,
                inputSelector: '.response',
                callback: (response: string) => {
                    var savedEncounter = this.encounter().Save(response);
                    var savedEncounters = this.library.SavedEncounterIndex;
                    if (savedEncounters.indexOf(response) == -1) {
                        savedEncounters.push(response);
                    }
                    Store.Save(Store.SavedEncounters, response, savedEncounter);
                }
            })
        }

        LoadEncounterByName = (encounterName: string) => {
            var encounter = Store.Load<ISavedEncounter<ISavedCreature>>(Store.SavedEncounters, encounterName);
            this.encounter().LoadSavedEncounter(encounter);
        }

        DeleteSavedEncounter = (encounterName: string) => {
            if (confirm(`Delete saved encounter "${encounterName}"? This cannot be undone.`)) {
                Store.Delete(Store.SavedEncounters, encounterName);
                this.library.SavedEncounterIndex.remove(encounterName);
            }
        }
    }
}