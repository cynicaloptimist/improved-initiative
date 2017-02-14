module ImprovedInitiative {
    export class EncounterCommander {
        Commands: Command[];
        
        constructor(private encounter: Encounter,
            private userPollQueue: UserPollQueue,
            private statBlockEditor: StatBlockEditor,
            private library: StatBlockLibrary,
            private eventLog: EventLog) {
            this.Commands = BuildEncounterCommandList(this);
        }

        AddStatBlockFromListing = (listing: StatBlockListing, event?) => {
            listing.LoadStatBlock(listing => {
                this.encounter.AddCombatantFromStatBlock(listing.StatBlock(), event);
                this.eventLog.AddEvent(`${listing.Name()} added to combat.`);
            });
        }

        private deleteSavedStatBlock = (library: string, id: string) => {
            Store.Delete(library, id);
            if (library == Store.PlayerCharacters) {
                this.library.PCStatBlocks.remove(c => c.Id == id);
            }
            if (library == Store.StatBlocks) {
                this.library.NPCStatBlocks.remove(c => c.Id == id);
            }
        }

        private saveNewStatBlock = (store: string, statBlockId: string, newStatBlock: IStatBlock) => {
            var listing = new StatBlockListing(statBlockId, newStatBlock.Name, newStatBlock.Type, null, "localStorage", newStatBlock);
            Store.Save<IStatBlock>(store, statBlockId, newStatBlock);
            if (store == Store.PlayerCharacters) {
                this.library.PCStatBlocks.unshift(listing);
            } else {
                this.library.NPCStatBlocks.unshift(listing);
            }
        }
        
        CreateAndEditStatBlock = (library: string) => {
            var statBlock = StatBlock.Empty();
            var newId = probablyUniqueString();

            if (library == "Players") {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                this.statBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            } else {
                statBlock.Name = "New Creature";
                this.statBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            }
        }
        
        private duplicateAndEditStatBlock = (listing: StatBlockListing) => {
            var statBlock = listing.StatBlock();
            var newId = probablyUniqueString();

            if (statBlock.Player == "player") {
                this.statBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            } else {
                this.statBlockEditor.EditStatBlock(newId, statBlock, this.saveNewStatBlock, () => { });
            }
        }
        
        EditStatBlock = (listing: StatBlockListing) => {
            if (listing.Source == "server") {
                listing.LoadStatBlock(this.duplicateAndEditStatBlock);
            } else {
                this.statBlockEditor.EditStatBlock(listing.Id, listing.StatBlock(), (store: string, statBlockId: string, newStatBlock: IStatBlock) => {
                    Store.Save<IStatBlock>(store, statBlockId, newStatBlock);
                    listing.StatBlock(newStatBlock);
                }, this.deleteSavedStatBlock);
            }
        }

        ShowingLibraries = ko.observable(true);
        ShowLibraries = () => this.ShowingLibraries(true);
        HideLibraries = () => this.ShowingLibraries(false);
        
        LaunchPlayerWindow = () => {
            window.open(`/p/${this.encounter.EncounterId}`, 'Player View');
        }

        ShowSettings = () => {
            $('.modal-container').show();
        }

        DisplayRoundCounter = ko.observable(Store.Load(Store.User, 'DisplayRoundCounter'))
        DisplayTurnTimer = ko.observable(Store.Load(Store.User, 'DisplayTurnTimer'))
        
        StartEncounter = () => {
            if(this.userPollQueue.HasPoll()){
                this.userPollQueue.AnimatePoll();
                return;
            }

            if (this.encounter.State() == 'inactive') {
                this.encounter.RollInitiative(this.userPollQueue);
            }
            
            this.HideLibraries();

            this.eventLog.AddEvent("Encounter started.");
        }

        EndEncounter = () => {
            this.encounter.EndEncounter();
            this.eventLog.AddEvent("Encounter ended.");
        }

        RerollInitiative = () => {
            this.encounter.RollInitiative(this.userPollQueue);
        }

        ClearEncounter = () => {
            this.encounter.ClearEncounter();
            this.eventLog.AddEvent("All combatants removed from encounter.");
        }

        NextTurn = () => {
            this.encounter.NextTurn();
            var currentCombatant = this.encounter.ActiveCombatant();
            this.eventLog.AddEvent(`Start of turn for ${currentCombatant.ViewModel.DisplayName()}.`);
        }

        PreviousTurn = () => {
            this.encounter.PreviousTurn();
            var currentCombatant = this.encounter.ActiveCombatant();
            this.eventLog.AddEvent(`Initiative rewound to ${currentCombatant.ViewModel.DisplayName()}.`);
        }

        SaveEncounter = () => {
            const poll = new DefaultPoll(`Save Encounter As: <input id='encounterName' class='response' type='text' />`,
                response => {
                    const encounterName = response['encounterName'];
                    if (encounterName) {
                        var savedEncounter = this.encounter.Save(encounterName);
                        var savedEncounters = this.library.SavedEncounterIndex;
                        if (savedEncounters.indexOf(encounterName) == -1) {
                            savedEncounters.push(encounterName);
                        }
                        Store.Save(Store.SavedEncounters, encounterName, savedEncounter);
                        this.eventLog.AddEvent(`Encounter saved as ${encounterName}.`);
                    }
                });
            this.userPollQueue.Add(poll);
        }

        LoadEncounterByName = (encounterName: string) => {
            var encounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, encounterName);
            this.encounter.LoadSavedEncounter(encounter, this.userPollQueue);
            this.eventLog.AddEvent(`Encounter loaded.`);
        }

        DeleteSavedEncounter = (encounterName: string) => {
            if (confirm(`Delete saved encounter "${encounterName}"? This cannot be undone.`)) {
                Store.Delete(Store.SavedEncounters, encounterName);
                this.library.SavedEncounterIndex.remove(encounterName);
                this.eventLog.AddEvent(`Encounter ${encounterName} deleted.`);
            }
        }
    }
}