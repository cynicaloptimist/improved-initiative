module ImprovedInitiative {
    export class TrackerViewModel {
        PromptQueue = new PromptQueue();
        EventLog = new EventLog();
        StatBlockEditor = new StatBlockEditor();
        Encounter = new Encounter(this.PromptQueue);

        TutorialVisible = ko.observable(!Store.Load(Store.User, 'SkipIntro'));
        SettingsVisible = ko.observable(false);
        BlurVisible = ko.pureComputed(() =>
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

        NPCLibrary = new NPCLibrary();
        PCLibrary = new PCLibrary();
        EncounterLibrary = new EncounterLibrary();

        EncounterCommander = new EncounterCommander(this);
        CombatantCommander = new CombatantCommander(this);

        ImportEncounterIfAvailable = () => {
            const encounterJSON = $('html')[0].getAttribute('postedEncounter');
            if (encounterJSON) {
                const encounter: { Combatants: any[] } = JSON.parse(encounterJSON);
                this.Encounter.ImportEncounter(encounter);
            }
        }

        InterfaceState = ko.pureComputed(() => {
            return [
                this.StatBlockEditor.HasStatBlock() ? 'editing-statblock' : null,
                this.CombatantCommander.HasSelected() ? 'combatant-selected' : null,
                this.EncounterCommander.ShowingLibraries() ? 'showing-libraries' : null,
                this.Encounter.State() === "active" ? 'encounter-active' : 'encounter-inactive'
            ].filter(s => s).join(' ');
        });
    }
}