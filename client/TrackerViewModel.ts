module ImprovedInitiative {
    export class TrackerViewModel {
        UserPollQueue = new UserPollQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.UserPollQueue);
        EncounterCommander = new EncounterCommander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.Library, this.EventLog);
        CombatantCommander = new CombatantCommander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.EventLog);
        Library = new StatBlockLibrary(this.EncounterCommander);
        
        ImportEncounterIfAvailable = () => {
            const encounterJSON = $('html')[0].getAttribute('postedEncounter');
            if(encounterJSON){
                const encounter: { Combatants: any [] } = JSON.parse(encounterJSON);
                this.Encounter.ImportEncounter(encounter);
            }
        }
    }
}