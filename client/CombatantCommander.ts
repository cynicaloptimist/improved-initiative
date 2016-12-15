module ImprovedInitiative {
    export class CombatantCommander {
        Commands: Command[];
        SelectedCreatures: KnockoutObservableArray<ICreature> = ko.observableArray<ICreature>([]);

        constructor(private encounter: Encounter,
            private userPollQueue: UserPollQueue,
            private statBlockEditor: StatBlockEditor,
            private eventLog: EventLog) {
            this.Commands = BuildCombatantCommandList(this);

            this.Commands.forEach(c => {
                var keyBinding = Store.Load<string>(Store.KeyBindings, c.Description);
                if (keyBinding) {
                    c.KeyBinding = keyBinding;
                }
                var showOnActionBar = Store.Load<boolean>(Store.ActionBar, c.Description);
                if (showOnActionBar != null) {
                    c.ShowOnActionBar(showOnActionBar);
                }
            });
        }

        HasSelectedCreature = ko.computed(() => this.SelectedCreatures().length > 0);

        SelectedCreatureStatblock: KnockoutComputed<IStatBlock> = ko.computed(() => {
            var selectedCreatures = this.SelectedCreatures();
            if (selectedCreatures.length == 1) {
                return selectedCreatures[0].StatBlock();
            } else {
                return StatBlock.Empty();
            }
        });

        SelectedCreatureNames: KnockoutComputed<string> = ko.computed(() =>
            this.SelectedCreatures()
                .map(c => c.ViewModel.DisplayName())
                .join(', ')
        );

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
            var newIndex = this.encounter.Creatures.indexOf(this.SelectedCreatures()[0]) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            } else if (newIndex >= this.encounter.Creatures().length) {
                newIndex = this.encounter.Creatures().length - 1;
            }
            this.SelectedCreatures.removeAll()
            this.SelectedCreatures.push(this.encounter.Creatures()[newIndex]);
        }

        RemoveSelectedCreatures = () => {
            var creaturesToRemove = this.SelectedCreatures.removeAll(),
                indexOfFirstCreatureToRemove = this.encounter.Creatures.indexOf(creaturesToRemove[0]),
                deletedCreatureNames = creaturesToRemove.map(c => c.StatBlock().Name);
            
            if (this.encounter.Creatures().length > creaturesToRemove.length) {
                while (creaturesToRemove.indexOf(this.encounter.ActiveCreature()) > -1) {
                    this.encounter.NextTurn();
                }
            }

            this.encounter.Creatures.removeAll(creaturesToRemove);

            var allMyFriendsAreGone = name => this.encounter.Creatures().every(c => c.StatBlock().Name != name);

            deletedCreatureNames.forEach(name => {
                if (allMyFriendsAreGone(name)) {
                    this.encounter.CreatureCountsByName[name](0);
                }
            });

            if (indexOfFirstCreatureToRemove >= this.encounter.Creatures().length) {
                indexOfFirstCreatureToRemove = this.encounter.Creatures().length - 1;
            }
            this.SelectCreature(this.encounter.Creatures()[indexOfFirstCreatureToRemove])

            this.eventLog.AddEvent(`${deletedCreatureNames.join(', ')} removed from encounter.`);

            this.encounter.QueueEmitEncounter();
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
                callback: response => {
                    if (response) {
                        selectedCreatures.forEach(c => c.ViewModel.ApplyDamage(response))
                        this.eventLog.AddEvent(`${response} damage applied to ${creatureNames}.`);
                        this.encounter.QueueEmitEncounter();
                    }
                }
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
                    this.eventLog.AddEvent(`${response} temporary hit points granted to ${creatureNames}.`);
                    this.encounter.QueueEmitEncounter();
                })
            });

            return false;
        }

        AddSelectedCreatureTag = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.AddTag())
            return false;
        }

        EditSelectedCreatureInitiative = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.EditInitiative())
            return false;
        }

        MoveSelectedCreatureUp = () => {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter.Creatures.indexOf(creature)
            if (creature && index > 0) {
                var newInitiative = this.encounter.MoveCreature(creature, index - 1);
                this.eventLog.AddEvent(`${creature.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
            }
        }

        MoveSelectedCreatureDown = () => {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter.Creatures.indexOf(creature)
            if (creature && index < this.encounter.Creatures().length - 1) {
                var newInitiative = this.encounter.MoveCreature(creature, index + 1);
                this.eventLog.AddEvent(`${creature.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
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
                    this.encounter.QueueEmitEncounter();
                }, (_, __) => {
                    this.RemoveSelectedCreatures();
                })
            }
        }

        
    }
}