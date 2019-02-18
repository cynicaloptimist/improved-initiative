import * as ko from "knockout";

import { StatBlock } from "../../common/StatBlock";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { CurrentSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { TutorialSpy } from "../Tutorial/TutorialViewModel";
import { ComponentLoader } from "../Utility/Components";
import { Metrics } from "../Utility/Metrics";
import { InitiativePrompt } from "./Prompts/InitiativePrompt";
import { QuickAddPrompt } from "./Prompts/QuickAddPrompt";

export class EncounterCommander {
  constructor(private tracker: TrackerViewModel) {}

  public AddStatBlockFromListing = (
    statBlock: StatBlock,
    hideOnAdd: boolean
  ) => {
    this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd);
    Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
    this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
  };

  public QuickAddStatBlock = () => {
    const prompt = new QuickAddPrompt(
      this.tracker.Encounter.AddCombatantFromStatBlock
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public ShowLibraries = () => this.tracker.LibrariesVisible(true);
  public HideLibraries = () => this.tracker.LibrariesVisible(false);

  public LaunchPlayerWindow = () => {
    window.open(`/p/${this.tracker.Encounter.EncounterId}`, "Player View");
    Metrics.TrackEvent("PlayerViewLaunched", {
      Id: this.tracker.Encounter.EncounterId
    });
  };

  public ShowSettings = () => {
    TutorialSpy("ShowSettings");
    this.tracker.SettingsVisible(true);
    Metrics.TrackEvent("SettingsOpened");
  };

  public ToggleToolbarWidth = () => {
    this.tracker.ToolbarWide(!this.tracker.ToolbarWide());
  };

  public DisplayRoundCounter = ko.computed(
    () => CurrentSettings().TrackerView.DisplayRoundCounter
  );
  public DisplayTurnTimer = ko.computed(
    () => CurrentSettings().TrackerView.DisplayTurnTimer
  );
  public DisplayDifficulty = ko.computed(
    () => CurrentSettings().TrackerView.DisplayDifficulty
  );

  private rollInitiative = () => {
    this.tracker.PromptQueue.Add(
      new InitiativePrompt(
        this.tracker.Encounter.Combatants(),
        this.tracker.Encounter.StartEncounter
      )
    );
  };

  public StartEncounter = () => {
    if (this.tracker.Encounter.Combatants().length == 0) {
      this.tracker.EventLog.AddEvent("Cannot start empty encounter.");
      return;
    }

    this.HideLibraries();

    if (this.tracker.Encounter.State() == "active") {
      return;
    }

    this.rollInitiative();

    ComponentLoader.AfterComponentLoaded(() =>
      TutorialSpy("ShowInitiativeDialog")
    );

    this.tracker.EventLog.AddEvent("Encounter started.");
    Metrics.TrackEvent("EncounterStarted", {
      CombatantCount: this.tracker.Encounter.Combatants().length
    });

    return false;
  };

  public EndEncounter = () => {
    if (this.tracker.Encounter.State() == "inactive") {
      return;
    }

    this.tracker.Encounter.EndEncounter();
    this.tracker.EventLog.AddEvent("Encounter ended.");
    Metrics.TrackEvent("EncounterEnded", {
      Combatants: this.tracker.Encounter.Combatants().length
    });

    return false;
  };

  public RerollInitiative = () => {
    this.rollInitiative();
    Metrics.TrackEvent("InitiativeRerolled");

    return false;
  };

  public ClearEncounter = () => {
    if (confirm("Remove all combatants and end encounter?")) {
      this.tracker.Encounter.ClearEncounter();
      this.tracker.CombatantViewModels([]);
      this.tracker.CombatantCommander.SelectedCombatants([]);
      this.tracker.EventLog.AddEvent("All combatants removed from encounter.");
      Metrics.TrackEvent("EncounterCleared");
    }

    return false;
  };

  public CleanEncounter = () => {
    if (confirm("Remove NPCs and end encounter?")) {
      const npcViewModels = this.tracker
        .CombatantViewModels()
        .filter(c => !c.Combatant.IsPlayerCharacter);
      this.tracker.CombatantCommander.SelectedCombatants([]);
      this.tracker.Encounter.EndEncounter();
      this.tracker.Encounter.RemoveCombatantsByViewModel(npcViewModels);
      this.tracker.Encounter.CombatantCountsByName({});
    }

    return false;
  };

  public LoadEncounter = (legacySavedEncounter: {}) => {
    const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);
    const nonPlayerCombatants = savedEncounter.Combatants.filter(
      c => c.StatBlock.Player != "player"
    );
    nonPlayerCombatants.forEach(this.tracker.Encounter.AddCombatantFromState);
    this.tracker.Encounter.QueueEmitEncounter();
    Metrics.TrackEvent("EncounterLoaded", {
      Name: savedEncounter.Name,
      Combatants: nonPlayerCombatants.map(c => c.StatBlock.Name)
    });
  };

  public NextTurn = () => {
    if (this.tracker.Encounter.State() != "active") {
      this.StartEncounter();
      return;
    }

    if (this.tracker.Encounter.Combatants().length == 0) {
      return;
    }

    if (!this.tracker.Encounter.ActiveCombatant()) {
      this.tracker.Encounter.ActiveCombatant(
        this.tracker.Encounter.Combatants()[0]
      );
      return;
    }

    const turnEndCombatant = this.tracker.Encounter.ActiveCombatant();
    if (turnEndCombatant) {
      Metrics.TrackEvent("TurnCompleted", {
        Name: turnEndCombatant.DisplayName()
      });
    }

    this.tracker.Encounter.NextTurn(this.RerollInitiative);

    const turnStartCombatant = this.tracker.Encounter.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Start of turn for ${turnStartCombatant.DisplayName()}.`
    );

    return false;
  };

  public PreviousTurn = () => {
    if (!this.tracker.Encounter.ActiveCombatant()) {
      return;
    }

    this.tracker.Encounter.PreviousTurn();
    let currentCombatant = this.tracker.Encounter.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Initiative rewound to ${currentCombatant.DisplayName()}.`
    );

    return false;
  };
}
