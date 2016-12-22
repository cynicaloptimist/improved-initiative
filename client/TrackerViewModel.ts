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
            const deepExtend = (a,b) => $.extend(true, {}, a, b);
            const postedEncounterJSON = $('html')[0].getAttribute('postedEncounter');
            const postedEncounter: { Combatants: any [] } = JSON.parse(postedEncounterJSON);
            if(postedEncounter.Combatants) {
                postedEncounter.Combatants.forEach(c => {
                    if(c.Id){
                        $.ajax(`/creatures/${c.Id}`)
                         .done(statBlockFromLibrary => {
                             const modifiedStatBlockFromLibrary = deepExtend(statBlockFromLibrary, c);
                             this.Encounter.AddCreature(modifiedStatBlockFromLibrary);
                         })
                         .fail(_ => {
                            this.Encounter.AddCreature(deepExtend(StatBlock.Empty(), c))
                         })
                    } else {
                        this.Encounter.AddCreature(deepExtend(StatBlock.Empty(), c))
                    }
                })
            }
        }
    }
}