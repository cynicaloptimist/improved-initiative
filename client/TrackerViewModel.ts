module ImprovedInitiative {
    export class TrackerViewModel {
        PromptQueue = new PromptQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.PromptQueue);
        
        StatBlockLibrary = new StatBlockLibrary();
        EncounterCommander = new EncounterCommander(this.Encounter, this.PromptQueue, this.StatBlockEditor, this.StatBlockLibrary, this.EventLog);
        CombatantCommander = new CombatantCommander(this.Encounter, this.PromptQueue, this.StatBlockEditor, this.EventLog);
        
        ImportEncounterIfAvailable = () => {
            const encounterJSON = $('html')[0].getAttribute('postedEncounter');
            if(encounterJSON){
                const encounter: { Combatants: any [] } = JSON.parse(encounterJSON);
                this.Encounter.ImportEncounter(encounter);
            }
        }

        InterfaceState = ko.computed(() => {
            return [
                this.StatBlockEditor.HasStatBlock() ? 'editing-statblock' : null,
                this.CombatantCommander.HasSelected() ? 'combatant-selected' : null,
                this.EncounterCommander.ShowingLibraries() ? 'showing-libraries' : null,
                this.Encounter.State() === "active" ? 'encounter-active' : 'encounter-inactive'
            ].filter(s => s).join(' ');
        });
    }
}