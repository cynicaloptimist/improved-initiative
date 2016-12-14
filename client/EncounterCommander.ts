module ImprovedInitiative {
    export class EncounterCommander {
        Commands: Command[];
        
        constructor(private encounter: Encounter,
            private userPollQueue: UserPollQueue,
            private statBlockEditor: StatBlockEditor,
            private library: CreatureLibrary,
            private eventLog: EventLog) {
            this.Commands = BuildEncounterCommandList(this);
        }

        AddCreatureFromListing = (listing: CreatureListing, event?) => {
            listing.LoadStatBlock(listing => {
                this.encounter.AddCreature(listing.StatBlock(), event);
                this.eventLog.AddEvent(`${listing.Name()} added to combat.`);
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
            var newId = probablyUniqueString();

            if (library == "Players") {
                statBlock.Name = "New Player Character";
                statBlock.Player = "player";
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            } else {
                statBlock.Name = "New Creature";
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            }
        }
        
        private duplicateAndEditCreature = (listing: CreatureListing) => {
            var statBlock = listing.StatBlock();
            var newId = probablyUniqueString();

            if (statBlock.Player == "player") {
                this.statBlockEditor.EditCreature(newId, statBlock, this.saveNewCreature, () => { });
            } else {
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

        ShowingLibraries = ko.observable(true);
        ShowLibraries = () => this.ShowingLibraries(true);
        HideLibraries = () => this.ShowingLibraries(false);
        
        LaunchPlayerWindow = () => {
            window.open(`/p/${this.encounter.EncounterId}`, 'Player View');
        }

        ShowSettings = () => {
            $('.modalcontainer').show();
        }

        DisplayRoundCounter = ko.observable(Store.Load(Store.User, 'DisplayRoundCounter'))
        DisplayTurnTimer = ko.observable(Store.Load(Store.User, 'DisplayTurnTimer'))
        
        StartEncounter = () => {
            if (this.encounter.State() == 'inactive') {
                this.encounter.RollInitiative(this.userPollQueue);
            }
            this.userPollQueue.Add({
                callback: this.encounter.StartEncounter
            });
            this.HideLibraries();

            this.eventLog.AddEvent("Encounter started.");
        }

        EndEncounter = () => {
            this.encounter.EndEncounter();
            this.eventLog.AddEvent("Encounter ended.");
        }

        ClearEncounter = () => {
            this.encounter.ClearEncounter();
            this.eventLog.AddEvent("All combatants removed from encounter.");
        }

        NextTurn = () => {
            this.encounter.NextTurn();
            var currentCreature = this.encounter.ActiveCreature();
            this.eventLog.AddEvent(`Start of turn for ${currentCreature.ViewModel.DisplayName()}.`);
        }

        PreviousTurn = () => {
            this.encounter.PreviousTurn();
            var currentCreature = this.encounter.ActiveCreature();
            this.eventLog.AddEvent(`Initiative rewound to ${currentCreature.ViewModel.DisplayName()}.`);
        }

        SaveEncounter = () => {
            this.userPollQueue.Add({
                requestContent: `Save Encounter As: <input class='response' type='text' value='' />`,
                inputSelector: '.response',
                callback: (response: string) => {
                    var savedEncounter = this.encounter.Save(response);
                    var savedEncounters = this.library.SavedEncounterIndex;
                    if (savedEncounters.indexOf(response) == -1) {
                        savedEncounters.push(response);
                    }
                    Store.Save(Store.SavedEncounters, response, savedEncounter);
                    this.eventLog.AddEvent(`Encounter saved.`);
                }
            })
        }

        LoadEncounterByName = (encounterName: string) => {
            var encounter = Store.Load<ISavedEncounter<ISavedCreature>>(Store.SavedEncounters, encounterName);
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