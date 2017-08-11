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
        SelectedCombatants: KnockoutObservableArray<CombatantViewModel> = ko.observableArray<CombatantViewModel>([]);

        HasSelected = ko.pureComputed(() => this.SelectedCombatants().length > 0);
        HasOneSelected = ko.pureComputed(() => this.SelectedCombatants().length === 1);
        HasMultipleSelected = ko.pureComputed(() => this.SelectedCombatants().length > 1);

        StatBlock: KnockoutComputed<StatBlock> = ko.pureComputed(() => {
            var selectedCombatants = this.SelectedCombatants();
            if (selectedCombatants.length == 1) {
                return selectedCombatants[0].Combatant.StatBlock();
            } else {
                return StatBlock.Default();
            }
        });

        Names: KnockoutComputed<string> = ko.pureComputed(() =>
            this.SelectedCombatants()
                .map(c => c.Name())
                .join(', ')
        );

        Select = (data: CombatantViewModel, e?: MouseEvent) => {
            if (!data) {
                return;
            }
            if (!(e && e.ctrlKey || e && e.metaKey)) {
                this.SelectedCombatants.removeAll();
            }
            this.SelectedCombatants.push(data);
        }

        private selectByOffset = (offset: number) => {
            var newIndex = this.tracker.CombatantViewModels().indexOf(this.SelectedCombatants()[0]) + offset;
            if (newIndex < 0) {
                newIndex = 0;
            } else if (newIndex >= this.tracker.CombatantViewModels().length) {
                newIndex = this.tracker.CombatantViewModels().length - 1;
            }
            this.SelectedCombatants.removeAll()
            this.SelectedCombatants.push(this.tracker.CombatantViewModels()[newIndex]);
        }

        Remove = () => {
            const combatantsToRemove = this.SelectedCombatants.removeAll(),
                firstDeletedIndex = this.tracker.CombatantViewModels().indexOf(combatantsToRemove[0]),
                deletedCombatantNames = combatantsToRemove.map(c => c.Combatant.StatBlock().Name);

            if (this.tracker.CombatantViewModels().length > combatantsToRemove.length) {
                let activeCombatant = this.tracker.Encounter.ActiveCombatant();
                while (combatantsToRemove.some(c => c.Combatant === activeCombatant)){
                    this.tracker.Encounter.NextTurn();
                    activeCombatant = this.tracker.Encounter.ActiveCombatant();
                }
            }

            this.tracker.CombatantViewModels.removeAll(combatantsToRemove);
            this.tracker.Encounter.Combatants.removeAll(combatantsToRemove.map(c => c.Combatant));

            const remainingCombatants = this.tracker.CombatantViewModels();

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
                this.Select(this.tracker.CombatantViewModels()[newSelectionIndex])
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
            const combatantNames = selectedCombatants.map(c => c.Name()).join(', ')
            const prompt = new DefaultPrompt(`Apply damage to ${combatantNames}: <input id='damage' class='response' type='number' />`,
                response => {
                    const damage = response['damage'];
                    if (damage) {
                        selectedCombatants.forEach(c => c.ApplyDamage(damage));
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
            const combatantNames = selectedCombatants.map(c => c.Name()).join(', ');
            const prompt = new DefaultPrompt(`Grant temporary hit points to ${combatantNames}: <input id='thp' class='response' type='number' />`,
                response => {
                    const thp = response['thp'];
                    if (thp) {
                        selectedCombatants.forEach(c => c.ApplyTemporaryHP(thp));
                        this.tracker.EventLog.AddEvent(`${thp} temporary hit points granted to ${combatantNames}.`);
                        this.tracker.Encounter.QueueEmitEncounter();
                    }
                });
            this.tracker.PromptQueue.Add(prompt);

            return false;
        }

        AddTag = (combatantVM?: CombatantViewModel) => {
            if (combatantVM instanceof CombatantViewModel) {
                this.Select(combatantVM);
            }
            this.SelectedCombatants().forEach(c => c.AddTag(this.tracker.Encounter))
            return false;
        }

        EditInitiative = () => {
            this.SelectedCombatants().forEach(c => c.EditInitiative())
            return false;
        }

        LinkInitiative = () => {
            const selected = this.SelectedCombatants();
            if (selected.length <= 1) {
                const message = `Select another combatant to link initiative. <br /><em>Tip:</em> You can select multiple combatants with 'ctrl', then use this command to link them to one shared initiative count.`;
                const prompt = new DefaultPrompt(message, _ => { });
                this.tracker.PromptQueue.Add(prompt);
                return;
            }
            const highestInitiative = selected.map(c => c.Combatant.Initiative()).sort((a, b) => b - a)[0];
            const initiativeGroup = probablyUniqueString();
            selected.forEach(s => {
                s.Combatant.Initiative(highestInitiative);
                s.Combatant.InitiativeGroup(initiativeGroup);
            });

            this.tracker.Encounter.SortByInitiative();
        }

        MoveUp = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.tracker.CombatantViewModels().indexOf(combatant)
            if (combatant && index > 0) {
                var newInitiative = this.tracker.Encounter.MoveCombatant(combatant.Combatant, index - 1);
                this.tracker.EventLog.AddEvent(`${combatant.Name()} initiative set to ${newInitiative}.`);
            }
        }

        MoveDown = () => {
            var combatant = this.SelectedCombatants()[0];
            var index = this.tracker.CombatantViewModels().indexOf(combatant)
            if (combatant && index < this.tracker.CombatantViewModels().length - 1) {
                var newInitiative = this.tracker.Encounter.MoveCombatant(combatant.Combatant, index + 1);
                this.tracker.EventLog.AddEvent(`${combatant.Name()} initiative set to ${newInitiative}.`);
            }
        }

        EditName = () => {
            this.SelectedCombatants().forEach(c => c.EditName())
            return false;
        }

        EditStatBlock = () => {
            if (this.SelectedCombatants().length == 1) {
                var selectedCombatant = this.SelectedCombatants()[0];
                this.tracker.StatBlockEditor.EditStatBlock(null, this.StatBlock(), (_, __, newStatBlock) => {
                    selectedCombatant.Combatant.StatBlock(newStatBlock);
                    this.tracker.Encounter.QueueEmitEncounter();
                }, (_, __) => {
                    this.Remove();
                },
                    "instance");
            }
        }
    }
}
