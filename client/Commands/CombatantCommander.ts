module ImprovedInitiative {
    export class CombatantCommander {
        constructor(private tracker: TrackerViewModel) {
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

        HasSelected = ko.pureComputed(() => this.SelectedCombatants().length > 0);
        HasOneSelected = ko.pureComputed(() => this.SelectedCombatants().length === 1);
        HasMultipleSelected = ko.pureComputed(() => this.SelectedCombatants().length > 1);

        StatBlock: KnockoutComputed<StatBlock> = ko.pureComputed(() => {
            var selectedCombatants = this.SelectedCombatants();
            if (selectedCombatants.length == 1) {
                return selectedCombatants[0].StatBlock();
            } else {
                return StatBlock.Default();
            }
        });

        Names: KnockoutComputed<string> = ko.pureComputed(() =>
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
            var newIndex = this.tracker.Encounter.Combatants.indexOf(this.SelectedCombatants()[0]) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            } else if (newIndex >= this.tracker.Encounter.Combatants().length) {
                newIndex = this.tracker.Encounter.Combatants().length - 1;
            }
            this.SelectedCombatants.removeAll()
            this.SelectedCombatants.push(this.tracker.Encounter.Combatants()[newIndex]);
        }

        Remove = () => {
            const combatantsToRemove = this.SelectedCombatants.removeAll(),
                firstDeletedIndex = this.tracker.Encounter.Combatants.indexOf(combatantsToRemove[0]),
                deletedCombatantNames = combatantsToRemove.map(c => c.StatBlock().Name);

            if (this.tracker.Encounter.Combatants().length > combatantsToRemove.length) {
                while (combatantsToRemove.indexOf(this.tracker.Encounter.ActiveCombatant()) > -1) {
                    this.tracker.Encounter.NextTurn();
                }
            }

            this.tracker.Encounter.Combatants.removeAll(combatantsToRemove);

            const remainingCombatants = this.tracker.Encounter.Combatants();

            var allMyFriendsAreGone = name => remainingCombatants.every(c => c.StatBlock().Name != name);

            deletedCombatantNames.forEach(name => {
                if (allMyFriendsAreGone(name)) {
                    this.tracker.Encounter.CombatantCountsByName[name](0);
                }
            });

            if (remainingCombatants.length > 0) {
                const newSelectionIndex =
                    firstDeletedIndex > remainingCombatants.length ?
                        remainingCombatants.length - 1 :
                        firstDeletedIndex;
                this.Select(this.tracker.Encounter.Combatants()[newSelectionIndex])
            } else {
                this.tracker.Encounter.EndEncounter();
            }

            this.tracker.EventLog.AddEvent(`${deletedCombatantNames.join(', ')} removed from encounter.`);

            this.tracker.Encounter.QueueEmitEncounter();
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
                        selectedCombatants.forEach(c => c.ViewModel.ApplyDamage(damage));
                        const damageNum = parseInt(damage);
                        if (damageNum > 0) {
                            this.tracker.EventLog.AddEvent(`${damageNum} damage applied to ${combatantNames}.`);
                        }
                        if (damageNum < 0) {
                            this.tracker.EventLog.AddEvent(`${-damageNum} HP restored to ${combatantNames}.`);
                        }
                        this.tracker.Encounter.QueueEmitEncounter();
                    }
                });
            this.tracker.PromptQueue.Add(prompt);
            return false;
        }

        CheckConcentration = (combatant: Combatant, damageAmount: number) => {
            setTimeout(() => {
                const prompt = new ConcentrationPrompt(combatant, damageAmount);
                this.tracker.PromptQueue.Add(prompt);
            }, 1);
        }

        AddTemporaryHP = () => {
            const selectedCombatants = this.SelectedCombatants();
            const combatantNames = selectedCombatants.map(c => c.ViewModel.DisplayName()).join(', ');
            const prompt = new DefaultPrompt(`Grant temporary hit points to ${combatantNames}: <input id='thp' class='response' type='number' />`,
                response => {
                    const thp = response['thp'];
                    if (thp) {
                        selectedCombatants.forEach(c => c.ViewModel.ApplyTemporaryHP(thp));
                        this.tracker.EventLog.AddEvent(`${thp} temporary hit points granted to ${combatantNames}.`);
                        this.tracker.Encounter.QueueEmitEncounter();
                    }
                });
            this.tracker.PromptQueue.Add(prompt);

            return false;
        }

        AddTag = (combatantVM?: CombatantViewModel) => {
            if (combatantVM instanceof CombatantViewModel) {
                this.Select(combatantVM.Combatant);
            }
            this.SelectedCombatants().forEach(c => c.ViewModel.AddTag(this.tracker.Encounter))
            return false;
        }

        EditInitiative = () => {
            this.SelectedCombatants().forEach(c => c.ViewModel.EditInitiative())
            return false;
        }

        LinkInitiative = () => {
            const selected = this.SelectedCombatants();
            if (selected.length <= 1) {
                const prompt = new DefaultPrompt(`Select multiple combatants with 'ctrl', then use this command to link them to one shared initiative count.`,
                    _ => { });
                this.tracker.PromptQueue.Add(prompt);
                return;
            }
            const highestInitiative = selected.map(c => c.Initiative()).sort((a, b) => b - a)[0];
            const initiativeGroup = probablyUniqueString();
            selected.forEach(s => {
                s.Initiative(highestInitiative);
                s.InitiativeGroup(initiativeGroup);
            });

            this.tracker.Encounter.SortByInitiative();
        }

        MoveUp = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.tracker.Encounter.Combatants.indexOf(combatant)
            if (combatant && index > 0) {
                var newInitiative = this.tracker.Encounter.MoveCombatant(combatant, index - 1);
                this.tracker.EventLog.AddEvent(`${combatant.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
            }
        }

        MoveDown = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.tracker.Encounter.Combatants.indexOf(combatant)
            if (combatant && index < this.tracker.Encounter.Combatants().length - 1) {
                var newInitiative = this.tracker.Encounter.MoveCombatant(combatant, index + 1);
                this.tracker.EventLog.AddEvent(`${combatant.ViewModel.DisplayName()} initiative set to ${newInitiative}.`);
            }
        }

        EditName = () => {
            this.SelectedCombatants().forEach(c => c.ViewModel.EditName())
            return false;
        }

        EditStatBlock = () => {
            if (this.SelectedCombatants().length == 1) {
                var selectedCombatant = this.SelectedCombatants()[0];
                this.tracker.StatBlockEditor.EditStatBlock(null, this.StatBlock(), (_, __, newStatBlock) => {
                    selectedCombatant.StatBlock(newStatBlock);
                    this.tracker.Encounter.QueueEmitEncounter();
                }, (_, __) => {
                    this.Remove();
                },
                    "instance");
            }
        }
    }
}