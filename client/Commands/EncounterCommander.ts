module ImprovedInitiative {
    export class EncounterCommander {
        Commands: Command[];
        
        constructor(private tracker: TrackerViewModel) {
            this.Commands = BuildEncounterCommandList(this);
        }

        AddStatBlockFromListing = (listing: StatBlockListing, event?) => {
            listing.LoadStatBlock(listing => {
                this.tracker.Encounter.AddCombatantFromStatBlock(listing.StatBlock(), event);
                this.tracker.EventLog.AddEvent(`${listing.Name()} added to combat.`);
            });
        }

        private deleteSavedStatBlock = (library: string, id: string) => {
            Store.Delete(library, id);
            if (library == Store.PlayerCharacters) {
                this.tracker.PCLibrary.StatBlocks.remove(c => c.Id == id);
            }
            if (library == Store.StatBlocks) {
                this.tracker.NPCLibrary.StatBlocks.remove(c => c.Id == id);
            }
        }

        private saveNewStatBlock = (store: string, statBlockId: string, newStatBlock: StatBlock) => {
            var listing = new StatBlockListing(statBlockId, newStatBlock.Name, newStatBlock.Type, null, "localStorage", newStatBlock);
            Store.Save<StatBlock>(store, statBlockId, newStatBlock);
            if (store == Store.PlayerCharacters) {
                this.tracker.PCLibrary.StatBlocks.unshift(listing);
            } else {
                this.tracker.NPCLibrary.StatBlocks.unshift(listing);
            }
        }
        
        CreateAndEditStatBlock = (library: string) => {
            var statBlock = StatBlock.Default();
            var newId = probablyUniqueString();

            if (library == "Players") {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            } else {
                statBlock.Name = "New Creature";
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            }
        }
        
        private duplicateAndEditStatBlock = (listing: StatBlockListing) => {
            var statBlock = listing.StatBlock();
            var newId = probablyUniqueString();

            if (statBlock.Player == "player") {
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            } else {
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            }
        }
        
        EditStatBlock = (listing: StatBlockListing) => {
            if (listing.Source == "server") {
                listing.LoadStatBlock(this.duplicateAndEditStatBlock);
            } else {
                this.tracker.StatBlockEditor.EditStatBlock(listing.Id, listing.StatBlock(), (store: string, statBlockId: string, newStatBlock: StatBlock) => {
                    Store.Save<StatBlock>(store, statBlockId, newStatBlock);
                    listing.StatBlock(newStatBlock);
                }, this.deleteSavedStatBlock);
            }
        }

        ShowingLibraries = ko.observable(true);
        ShowLibraries = () => this.ShowingLibraries(true);
        HideLibraries = () => this.ShowingLibraries(false);
        
        LaunchPlayerWindow = () => {
            window.open(`/p/${this.tracker.Encounter.EncounterId}`, 'Player View');
        }

        ShowSettings = () => {
            TutorialSpy("ShowSettings");
            this.tracker.SettingsVisible(true);
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
                        var savedEncounter = this.tracker.Encounter.Save(encounterName);
                        var savedEncounters = this.tracker.EncounterLibrary.SavedEncounterIndex;
                        if (savedEncounters.indexOf(encounterName) == -1) {
                            savedEncounters.push(encounterName);
                        }
                        Store.Save(Store.SavedEncounters, encounterName, savedEncounter);
                        this.tracker.EventLog.AddEvent(`Encounter saved as ${encounterName}.`);
                    }
                });
            this.tracker.PromptQueue.Add(prompt);
        }

        LoadEncounterByName = (encounterName: string) => {
            var encounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, encounterName);
            this.tracker.Encounter.LoadSavedEncounter(encounter, this.tracker.PromptQueue);
            this.tracker.EventLog.AddEvent(`Encounter loaded.`);
        }

        DeleteSavedEncounter = (encounterName: string) => {
            if (confirm(`Delete saved encounter "${encounterName}"? This cannot be undone.`)) {
                Store.Delete(Store.SavedEncounters, encounterName);
                this.tracker.EncounterLibrary.SavedEncounterIndex.remove(encounterName);
                this.tracker.EventLog.AddEvent(`Encounter ${encounterName} deleted.`);
            }
        }
    }
}