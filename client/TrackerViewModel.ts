module ImprovedInitiative {
    export class TrackerViewModel {
        constructor() {
            this.Commander.RegisterKeyBindings();
        }
        UserPollQueue = new UserPollQueue();
        StatBlockEditor = new StatBlockEditor();
        Encounter = ko.observable(new Encounter());
        Library = new CreatureLibrary();
        Commander = new Commander(this.Encounter, this.UserPollQueue, this.StatBlockEditor, this.Library)
    }
}