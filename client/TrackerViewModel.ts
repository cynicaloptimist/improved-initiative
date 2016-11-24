module ImprovedInitiative {
    export class TrackerViewModel {
        constructor() {
            this.Commander.RegisterKeyBindings();
        }
        UserPollQueue = new UserPollQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.UserPollQueue);
        Library = new CreatureLibrary();
        Commander = new Commander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.Library, this.EventLog);
    }
}