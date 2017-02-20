module ImprovedInitiative {
    export class TrackerViewModel {
        PromptQueue = new PromptQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.PromptQueue);

        TutorialVisible = ko.observable(!Store.Load(Store.User, 'SkipIntro'));
        SettingsVisible = ko.observable(false);
        BlurVisible = ko.computed(() =>
            this.TutorialVisible() ||
            this.SettingsVisible()
        );
        CloseSettings = () => {
            this.SettingsVisible(false);
        };
        RepeatTutorial = () => {
            this.Encounter.EndEncounter();
            this.EncounterCommander.ShowLibraries();
            this.SettingsVisible(false);
            this.TutorialVisible(true);
        }

        StatBlockLibrary = new StatBlockLibrary();
        EncounterCommander = new EncounterCommander(this.Encounter, this.PromptQueue, this.StatBlockEditor, this.StatBlockLibrary, this.EventLog, this.SettingsVisible);
        CombatantCommander = new CombatantCommander(this.Encounter, this.PromptQueue, this.StatBlockEditor, this.EventLog);

        ImportEncounterIfAvailable = () => {
            const encounterJSON = $('html')[0].getAttribute('postedEncounter');
            if (encounterJSON) {
                const encounter: { Combatants: any[] } = JSON.parse(encounterJSON);
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