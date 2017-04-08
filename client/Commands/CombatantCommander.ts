module ImprovedInitiative {
    export class CombatantCommander {
        constructor(private encounter: Encounter,
            private promptQueue: PromptQueue,
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

        Commands: Command[];
        SelectedCombatants: KnockoutObservableArray<Combatant> = ko.observableArray<Combatant>([]);

        HasSelected = ko.computed(() => this.SelectedCombatants().length > 0);
        HasOneSelected = ko.computed(() => this.SelectedCombatants().length === 1);
        HasMultipleSelected = ko.computed(() => this.SelectedCombatants().length > 1);

        StatBlock: KnockoutComputed<StatBlock> = ko.computed(() => {
            var selectedCombatants = this.SelectedCombatants();
            if (selectedCombatants.length == 1) {
                return selectedCombatants[0].StatBlock();
            } else {
                return StatBlock.Default();
            }
        });

        Names: KnockoutComputed<string> = ko.computed(() =>
            this.SelectedCombatants()
                .map(c => c.ViewModel.DisplayName())
                .join(', ')
        );

        Select = (data: Combatant, e?: MouseEvent) => {
            if (!data) {
                return;
            }
            if (!(e && e.ctrlKey)) {
                this.SelectedCombatants.removeAll();
            }
            this.SelectedCombatants.push(data);
        }

        private selectByOffset = (offset: number) => {
            var newIndex = this.encounter.Combatants.indexOf(this.SelectedCombatants()[0]) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            } else if (newIndex >= this.encounter.Combatants().length) {
                newIndex = this.encounter.Combatants().length - 1;
            }
            this.SelectedCombatants.removeAll()
            this.SelectedCombatants.push(this.encounter.Combatants()[newIndex]);
        }

        Remove = () => {
            var combatantsToRemove = this.SelectedCombatants.removeAll(),
                indexOfFirstCombatantToRemove = this.encounter.Combatants.indexOf(combatantsToRemove[0]),
                deletedCombatantNames = combatantsToRemove.map(c => c.StatBlock().Name);

            if (this.encounter.Combatants().length > combatantsToRemove.length) {
                while (combatantsToRemove.indexOf(this.encounter.ActiveCombatant()) > -1) {
                    this.encounter.NextTurn();
                }
            }

            this.encounter.Combatants.removeAll(combatantsToRemove);

            var allMyFriendsAreGone = name => this.encounter.Combatants().every(c => c.StatBlock().Name != name);

            deletedCombatantNames.forEach(name => {
                if (allMyFriendsAreGone(name)) {
                    this.encounter.CombatantCountsByName[name](0);
                }
            });

            if (indexOfFirstCombatantToRemove >= this.encounter.Combatants().length) {
                indexOfFirstCombatantToRemove = this.encounter.Combatants().length - 1;
            }
            this.Select(this.encounter.Combatants()[indexOfFirstCombatantToRemove])

            this.eventLog.AddEvent(`${deletedCombatantNames.join(', ')} removed from encounter.`);

            this.encounter.QueueEmitEncounter();
        }

        SelectPrevious = () => {
            this.selectByOffset(-1);
        }

        SelectNext = () => {
            this.selectByOffset(1);
        }

        EditHP = () => {
            const selectedCombatants = this.SelectedCombatants();
            const combatantNames = selectedCombatants.map(c => c.ViewModel.DisplayName()).join(', ')
            const prompt = new DefaultPrompt(`Apply damage to ${combatantNames}: <input id='damage' class='response' type='number' />`,
                response => {
                    const damage = response['damage'];
                    if (damage) {
                        selectedCombatants.forEach(c => c.ViewModel.ApplyDamage(damage))
                        this.eventLog.AddEvent(`${damage} damage applied to ${combatantNames}.`);
                        this.encounter.QueueEmitEncounter();
                    }
                });
            this.promptQueue.Add(prompt);
            return false;
        }

        AddTemporaryHP = () => {
            const selectedCombatants = this.SelectedCombatants();
            const combatantNames = selectedCombatants.map(c => c.ViewModel.DisplayName()).join(', ');
            const prompt = new DefaultPrompt(`Grant temporary hit points to ${combatantNames}: <input id='thp' class='response' type='number' />`,
                response => {
                    const thp = response['thp'];
                    if (thp) {
                        selectedCombatants.forEach(c => c.ViewModel.ApplyTemporaryHP(thp));
                        this.eventLog.AddEvent(`${thp} temporary hit points granted to ${combatantNames}.`);
                        this.encounter.QueueEmitEncounter();
                    }    
                });
            this.promptQueue.Add(prompt);

            return false;
        }

        AddTag = (combatantVM?: CombatantViewModel) => {
            if (combatantVM instanceof CombatantViewModel) {
                this.Select(combatantVM.Combatant);
            }
            this.SelectedCombatants().forEach(c => c.ViewModel.AddTag(this.encounter))
            return false;
        }

        EditInitiative = () => {
            this.SelectedCombatants().forEach(c => c.ViewModel.EditInitiative())
            return false;
        }

        MoveUp = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.encounter.Combatants.indexOf(combatant)
            if (combatant && index > 0) {
                var newInitiative = this.encounter.MoveCombatant(combatant, index - 1);
                this.eventLog.AddEvent(`${combatant.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
            }
        }

        MoveDown = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.encounter.Combatants.indexOf(combatant)
            if (combatant && index < this.encounter.Combatants().length - 1) {
                var newInitiative = this.encounter.MoveCombatant(combatant, index + 1);
                this.eventLog.AddEvent(`${combatant.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
            }
        }

        EditName = () => {
            this.SelectedCombatants().forEach(c => c.ViewModel.EditName())
            return false;
        }

        EditStatBlock = () => {
            if (this.SelectedCombatants().length == 1) {
                var selectedCombatant = this.SelectedCombatants()[0];
                this.statBlockEditor.EditStatBlock(null, this.StatBlock(), (_, __, newStatBlock) => {
                    selectedCombatant.StatBlock(newStatBlock);
                    this.encounter.QueueEmitEncounter();
                }, (_, __) => {
                    this.Remove();
                })
            }
        }
    }
}