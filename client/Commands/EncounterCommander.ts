module ImprovedInitiative {
    export class EncounterCommander {
        Commands: Command[];
        private libraries: Libraries;

        constructor(private tracker: TrackerViewModel) {
            this.Commands = BuildEncounterCommandList(this);
            this.libraries = tracker.Libraries;
        }

        AddStatBlockFromListing = (listing: StatBlockListing, event?) => {
            listing.GetStatBlockAsync(statBlock => {
                this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, event);
                this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
            });
        }

        private deleteSavedStatBlock = (library: string, id: string) => {
            Store.Delete(library, id);
            if (library == Store.PlayerCharacters) {
                this.libraries.PCs.StatBlocks.remove(c => c.Id == id);
            }
            if (library == Store.StatBlocks) {
                this.libraries.NPCs.StatBlocks.remove(c => c.Id == id);
            }
        }

        private saveNewStatBlock = (store: string, statBlockId: string, newStatBlock: StatBlock) => {
            var listing = new StatBlockListing(statBlockId, newStatBlock.Name, newStatBlock.Type, null, "localStorage", newStatBlock);
            Store.Save<StatBlock>(store, statBlockId, newStatBlock);
            if (store == Store.PlayerCharacters) {
                this.libraries.PCs.StatBlocks.unshift(listing);
            } else {
                this.libraries.NPCs.StatBlocks.unshift(listing);
            }
        }
        
        CreateAndEditStatBlock = (isPlayerCharacter: boolean) => {
            var statBlock = StatBlock.Default();
            var newId = probablyUniqueString();

            if (isPlayerCharacter) {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            } else {
                statBlock.Name = "New Creature";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            }
        }
        
        private duplicateAndEditStatBlock = (statBlock: StatBlock) => {
            var newId = probablyUniqueString();
            this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
        }
        
        EditStatBlock = (listing: StatBlockListing) => {
            listing.GetStatBlockAsync(statBlock => {
                if (listing.Source === "server") {
                    this.duplicateAndEditStatBlock(statBlock);
                } else {
                    this.tracker.StatBlockEditor.EditStatBlock(listing.Id, statBlock, (store: string, statBlockId: string, newStatBlock: StatBlock) => {
                        Store.Save<StatBlock>(store, statBlockId, newStatBlock);
                        listing.SetStatBlock(newStatBlock);
                    }, this.deleteSavedStatBlock);
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

        EditSpell = (listing: SpellListing) => {
             listing.GetSpellAsync(spell => {
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

        ReferenceSpell = (spellListing: SpellListing) => {
            const prompt = new SpellPrompt(spellListing);
            this.tracker.PromptQueue.Add(prompt);
        }

        DisplayRoundCounter = ko.observable(Store.Load(Store.User, 'DisplayRoundCounter'));
        DisplayTurnTimer = ko.observable(Store.Load(Store.User, 'DisplayTurnTimer'));
        DisplayDifficulty = ko.observable(Store.Load(Store.User, 'DisplayDifficulty'));
        
        StartEncounter = () => {
            if(this.tracker.PromptQueue.HasPrompt()){
                this.tracker.PromptQueue.AnimatePrompt();
                return;
            }

            if (this.tracker.Encounter.State() == 'inactive') {
                this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);

                ComponentLoader.AfterComponentLoaded(() => TutorialSpy("ShowInitiativeDialog"));
            }
            
            this.HideLibraries();

            this.tracker.EventLog.AddEvent("Encounter started.");
        }

        EndEncounter = () => {
            this.tracker.Encounter.EndEncounter();
            this.tracker.EventLog.AddEvent("Encounter ended.");
        }

        RerollInitiative = () => {
            this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);
        }

        ClearEncounter = () => {
            this.tracker.Encounter.ClearEncounter();
            this.tracker.EventLog.AddEvent("All combatants removed from encounter.");
        }

        NextTurn = () => {
            this.tracker.Encounter.NextTurn();
            var currentCombatant = this.tracker.Encounter.ActiveCombatant();
            this.tracker.EventLog.AddEvent(`Start of turn for ${currentCombatant.ViewModel.DisplayName()}.`);
        }

        PreviousTurn = () => {
            if (!this.tracker.Encounter.ActiveCombatant()) {
                return;
            }
            this.tracker.Encounter.PreviousTurn();
            var currentCombatant = this.tracker.Encounter.ActiveCombatant();
            this.tracker.EventLog.AddEvent(`Initiative rewound to ${currentCombatant.ViewModel.DisplayName()}.`);    
        }

        SaveEncounter = () => {
            const prompt = new DefaultPrompt(`Save Encounter As: <input id='encounterName' class='response' type='text' />`,
                response => {
                    const encounterName = response['encounterName'];
                    if (encounterName) {
                        const savedEncounter = this.tracker.Encounter.Save(encounterName);
                        this.libraries.Encounters.Save(encounterName, savedEncounter);
                        this.tracker.EventLog.AddEvent(`Encounter saved as ${encounterName}.`);
                    }
                });
            this.tracker.PromptQueue.Add(prompt);
        }

        LoadEncounterByName = (encounterName: string) => {
            const encounter = this.libraries.Encounters.Get(encounterName);
            this.tracker.Encounter.LoadSavedEncounter(encounter, this.tracker.PromptQueue);
            this.tracker.EventLog.AddEvent(`Encounter loaded.`);
        }

        DeleteSavedEncounter = (encounterName: string) => {
            if (confirm(`Delete saved encounter "${encounterName}"? This cannot be undone.`)) {
                this.libraries.Encounters.Delete(encounterName);
                this.tracker.EventLog.AddEvent(`Encounter ${encounterName} deleted.`);
            }
        }
    }
}