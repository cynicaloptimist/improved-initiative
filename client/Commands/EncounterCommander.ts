import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { CurrentSettings } from "../Settings/Settings";
import { StatBlock } from "../StatBlock/StatBlock";
import { TrackerViewModel } from "../TrackerViewModel";
import { TutorialSpy } from "../Tutorial/TutorialViewModel";
import { ComponentLoader } from "../Utility/Components";
import { Metrics } from "../Utility/Metrics";
import { QuickAddPromptWrapper } from "./Prompts/QuickAddPrompt";

export class EncounterCommander {
    constructor(private tracker: TrackerViewModel) {}

    public AddStatBlockFromListing = (statBlock: StatBlock, hideOnAdd: boolean) => {
        this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd);
        Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
        this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
    }

    public QuickAddStatBlock = () => {
        const prompt = new QuickAddPromptWrapper(this.tracker.Encounter.AddCombatantFromStatBlock);
        this.tracker.PromptQueue.Add(prompt);
    }

    public ShowLibraries = () => this.tracker.LibrariesVisible(true);
    public HideLibraries = () => this.tracker.LibrariesVisible(false);

    public LaunchPlayerWindow = () => {
        window.open(`/p/${this.tracker.Encounter.EncounterId}`, "Player View");
        Metrics.TrackEvent("PlayerViewLaunched", { Id: this.tracker.Encounter.EncounterId });
    }

    public ShowSettings = () => {
        TutorialSpy("ShowSettings");
        this.tracker.SettingsVisible(true);
        Metrics.TrackEvent("SettingsOpened");
    }

    public ToggleToolbarWidth = () => {
        this.tracker.ToolbarWide(!this.tracker.ToolbarWide());
    }

    public DisplayRoundCounter = ko.computed(() => CurrentSettings().TrackerView.DisplayRoundCounter);
    public DisplayTurnTimer = ko.computed(() => CurrentSettings().TrackerView.DisplayTurnTimer);
    public DisplayDifficulty = ko.computed(() => CurrentSettings().TrackerView.DisplayDifficulty);

    public StartEncounter = () => {
        if (this.tracker.PromptQueue.HasPrompt()) {
            this.tracker.PromptQueue.AnimatePrompt();
            return;
        }

        if (this.tracker.Encounter.State() == "inactive") {
            this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);

            ComponentLoader.AfterComponentLoaded(() => TutorialSpy("ShowInitiativeDialog"));
        }

        this.HideLibraries();

        this.tracker.EventLog.AddEvent("Encounter started.");
        Metrics.TrackEvent("EncounterStarted", { CombatantCount: this.tracker.Encounter.Combatants().length });

        return false;
    }

    public EndEncounter = () => {
        this.tracker.Encounter.EndEncounter();
        this.tracker.EventLog.AddEvent("Encounter ended.");
        Metrics.TrackEvent("EncounterEnded", { Combatants: this.tracker.Encounter.Combatants().length });

        return false;
    }

    public RerollInitiative = () => {
        this.tracker.Encounter.RollInitiative(this.tracker.PromptQueue);
        Metrics.TrackEvent("InitiativeRerolled");

        return false;
    }

    public ClearEncounter = () => {
        if (confirm("Remove all creatures and end encounter?")) {
            this.tracker.Encounter.ClearEncounter();
            this.tracker.CombatantViewModels([]);
            this.tracker.CombatantCommander.SelectedCombatants([]);
            this.tracker.EventLog.AddEvent("All combatants removed from encounter.");
            Metrics.TrackEvent("EncounterCleared");
        }

        return false;
    }

    public LoadEncounter = (legacySavedEncounter: {}) => {
        const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);
        this.tracker.Encounter.LoadSavedEncounter(savedEncounter);
        Metrics.TrackEvent("EncounterLoaded", { Name: savedEncounter.Name });
    }

    public NextTurn = () => {
        const turnEndCombatant = this.tracker.Encounter.ActiveCombatant();
        Metrics.TrackEvent("TurnCompleted", { Name: turnEndCombatant.DisplayName() });

        this.tracker.Encounter.NextTurn();
        const turnStartCombatant = this.tracker.Encounter.ActiveCombatant();
        this.tracker.EventLog.AddEvent(`Start of turn for ${turnStartCombatant.DisplayName()}.`);

        return false;
    }

    public PreviousTurn = () => {
        if (!this.tracker.Encounter.ActiveCombatant()) {
            return;
        }
        this.tracker.Encounter.PreviousTurn();
        let currentCombatant = this.tracker.Encounter.ActiveCombatant();
        this.tracker.EventLog.AddEvent(`Initiative rewound to ${currentCombatant.DisplayName()}.`);

        return false;
    }
}
