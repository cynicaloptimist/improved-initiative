module ImprovedInitiative {
    export class TrackerViewModel {
        UserPollQueue = new UserPollQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.UserPollQueue);
        Library = new CreatureLibrary();
        EncounterCommander = new EncounterCommander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.Library, this.EventLog);
        CombatantCommander = new CombatantCommander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.EventLog);

        LaunchPostedEncounterIfAvailable = () => {
            const postedEncounterJSON = $('html')[0].getAttribute('postedEncounter');
            const postedEncounter: { Combatants: any [] } = JSON.parse(postedEncounterJSON);
            if(postedEncounter.Combatants) {
                postedEncounter.Combatants.forEach(c => {
                    const fullStatBlock = { ...StatBlock.Empty(), ...c }
                    if(c.Id){
                        $.ajax(`/creatures/${c.Id}`)
                         .done(statBlock => {
                             const statBlockFromLibrary = { ...c, ...statBlock };
                             this.Encounter.AddCreature(statBlockFromLibrary);
                         })
                         .fail(_ => {
                            this.Encounter.AddCreature(fullStatBlock)
                         })
                    } else {
                        this.Encounter.AddCreature(fullStatBlock)
                    }
                })
            }
        }
    }
}