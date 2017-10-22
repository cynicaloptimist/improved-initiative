module ImprovedInitiative {
    export class EncounterCommander {
        Commands: Command[];
        private libraries: Libraries;
        private accountClient = new AccountClient();

        constructor(private tracker: TrackerViewModel) {
            this.Commands = BuildEncounterCommandList(this);
            this.libraries = tracker.Libraries;
        }

        AddStatBlockFromListing = (listing: Listing<StatBlock>, event?) => {
            listing.GetAsync(statBlock => {
                this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, event);
                this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
            });
        }

        private deleteSavedStatBlock = (library: string, statBlockId: string) => {
            Store.Delete(library, statBlockId);
            if (library == Store.PlayerCharacters) {
                this.libraries.PCs.DeleteListing(statBlockId);
            }
            if (library == Store.StatBlocks) {
                this.libraries.NPCs.DeleteListing(statBlockId);
            }
        }

        private saveNewStatBlock = (store: string, statBlockId: string, newStatBlock: StatBlock) => {
            const listing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Type, store, "localStorage", newStatBlock);
            Store.Save<StatBlock>(store, statBlockId, newStatBlock);
            if (store == Store.PlayerCharacters) {
                this.libraries.PCs.StatBlocks.unshift(listing);
                this.accountClient.SavePlayerCharacter(newStatBlock);
            } else {
                this.libraries.NPCs.StatBlocks.unshift(listing);
                this.accountClient.SaveStatBlock(newStatBlock);
            }
        }

        private saveEditedStatBlock = (listing: Listing<StatBlock>) =>
            (store: string, statBlockId: string, newStatBlock: StatBlock) => {
                Store.Save<StatBlock>(store, statBlockId, newStatBlock);
                listing.Value(newStatBlock);
                if (store == Store.PlayerCharacters) {
                    this.accountClient.SavePlayerCharacter(newStatBlock);
                } else {
                    this.accountClient.SaveStatBlock(newStatBlock);
                }
            }


        CreateAndEditStatBlock = (isPlayerCharacter: boolean) => {
            var statBlock = StatBlock.Default();
            var newId = probablyUniqueString();

            if (isPlayerCharacter) {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { }, "global");
            } else {
                statBlock.Name = "New Creature";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { }, "global");
            }
        }

        EditStatBlock = (listing: Listing<StatBlock>) => {
            listing.GetAsync(statBlock => {
                if (listing.Source === "server") {
                    var newId = probablyUniqueString();
                    this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { }, "global");
                } else {
                    this.tracker.StatBlockEditor.EditStatBlock(listing.Id, statBlock, this.saveEditedStatBlock(listing), this.deleteSavedStatBlock, "global");
                }
            });
        }

        CreateAndEditSpell = () => {
            const newSpell = { ...Spell.Default(), Name: "New Spell", Source: "Custom" };
            this.tracker.SpellEditor.EditSpell(
                newSpell,
                this.libraries.Spells.AddOrUpdateSpell,
                this.libraries.Spells.DeleteSpellById
            );
        }

        EditSpell = (listing: Listing<Spell>) => {
            listing.GetAsync(spell => {
                this.tracker.SpellEditor.EditSpell(
                    spell,
                    this.libraries.Spells.AddOrUpdateSpell,
                    this.libraries.Spells.DeleteSpellById
                );
            });
        }

        ShowLibraries = () => this.tracker.LibrariesVisible(true);
        HideLibraries = () => this.tracker.LibrariesVisible(false);

        LaunchPlayerWindow = () => {
            window.open(`/p/${this.tracker.Encounter.EncounterId}`, 'Player View');
        }

        ShowSettings = () => {
            TutorialSpy("ShowSettings");
            this.tracker.SettingsVisible(true);
        }

        ToggleToolbarWidth = () => {
            this.tracker.ToolbarWide(!this.tracker.ToolbarWide());
        }

        RollDice = (diceExpression: string) => {
            const diceRoll = Dice.RollDiceExpression(diceExpression);
            const prompt = new DefaultPrompt(`Rolled: ${diceExpression} -> ${diceRoll.String} <input class='response' type='number' value='${diceRoll.Total}' />`,
                _ => { }
            );
            this.tracker.PromptQueue.Add(prompt);
        }

        ReferenceSpell = (spellListing: Listing<Spell>) => {
            const prompt = new SpellPrompt(spellListing);
            this.tracker.PromptQueue.Add(prompt);
        }

        DisplayRoundCounter = ko.computed(() => CurrentSettings().TrackerView.DisplayRoundCounter);
        DisplayTurnTimer = ko.computed(() => CurrentSettings().TrackerView.DisplayTurnTimer);
        DisplayDifficulty = ko.computed(() => CurrentSettings().TrackerView.DisplayDifficulty);

        StartEncounter = () => {
            if (this.tracker.PromptQueue.HasPrompt()) {
                this.tracker.PromptQueue.AnimatePrompt();
                return;
            }

            if (this.tracker.Encounter.State() == 'inactive') {
                this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);

                ComponentLoader.AfterComponentLoaded(() => TutorialSpy("ShowInitiativeDialog"));
            }

            this.HideLibraries();

            this.tracker.EventLog.AddEvent("Encounter started.");

            return false;
        }

        EndEncounter = () => {
            this.tracker.Encounter.EndEncounter();
            this.tracker.EventLog.AddEvent("Encounter ended.");

            return false;
        }

        RerollInitiative = () => {
            this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);

            return false;
        }

        ClearEncounter = () => {
            this.tracker.Encounter.ClearEncounter();
            this.tracker.CombatantViewModels([]);
            this.tracker.CombatantCommander.SelectedCombatants([]);
            this.tracker.EventLog.AddEvent("All combatants removed from encounter.");

            return false;
        }

        NextTurn = () => {
            this.tracker.Encounter.NextTurn();
            var currentCombatant = this.tracker.Encounter.ActiveCombatant();
            this.tracker.EventLog.AddEvent(`Start of turn for ${currentCombatant.DisplayName()}.`);

            return false;
        }

        PreviousTurn = () => {
            if (!this.tracker.Encounter.ActiveCombatant()) {
                return;
            }
            this.tracker.Encounter.PreviousTurn();
            var currentCombatant = this.tracker.Encounter.ActiveCombatant();
            this.tracker.EventLog.AddEvent(`Initiative rewound to ${currentCombatant.DisplayName()}.`);

            return false;
        }

        SaveEncounter = () => {
            const prompt = new DefaultPrompt(`Save Encounter As: <input id='encounterName' class='response' type='text' />`,
                response => {
                    const encounterName = response['encounterName'];
                    if (encounterName) {
                        const savedEncounter = this.tracker.Encounter.Save(encounterName);
                        this.libraries.Encounters.Save(savedEncounter);
                        this.tracker.EventLog.AddEvent(`Encounter saved as ${encounterName}.`);
                    }
                });
            this.tracker.PromptQueue.Add(prompt);
        }

        LoadEncounterByName = (encounterName: string) => {
            const encounter = this.libraries.Encounters.Get(encounterName,
                encounter => {
                    this.tracker.Encounter.LoadSavedEncounter(encounter, this.tracker.PromptQueue);
                    this.tracker.EventLog.AddEvent(`Encounter loaded.`);
                });
        }

        DeleteSavedEncounter = (encounterName: string) => {
            if (confirm(`Delete saved encounter "${encounterName}"? This cannot be undone.`)) {
                this.libraries.Encounters.Delete(encounterName);
                this.tracker.EventLog.AddEvent(`Encounter ${encounterName} deleted.`);
            }
        }
    }
}