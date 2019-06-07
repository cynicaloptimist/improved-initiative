import * as ko from "knockout";

import { StatBlock } from "../../common/StatBlock";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { CurrentSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { TutorialSpy } from "../Tutorial/TutorialViewModel";
import { ComponentLoader } from "../Utility/Components";
import { Metrics } from "../Utility/Metrics";
import { InitiativePrompt } from "./Prompts/InitiativePrompt";
import { PlayerViewPrompt } from "./Prompts/PlayerViewPrompt";
import { QuickAddPrompt } from "./Prompts/QuickAddPrompt";
import { ToggleFullscreen } from "./ToggleFullscreen";

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
    this.tracker.PromptQueue.AddLegacyPrompt(prompt);
  };

  public ShowLibraries = () => this.tracker.LibrariesVisible(true);
  public HideLibraries = () => this.tracker.LibrariesVisible(false);

  public LaunchPlayerView = () => {
    const prompt = PlayerViewPrompt(
      this.tracker.Encounter.EncounterId,
      this.tracker.Encounter.TemporaryBackgroundImageUrl(),
      backgroundImageUrl =>
        this.tracker.Encounter.TemporaryBackgroundImageUrl(backgroundImageUrl)
    );
    this.tracker.PromptQueue.Add(prompt);

    Metrics.TrackEvent("PlayerViewLaunched", {
      Id: this.tracker.Encounter.EncounterId
    });
  };

  public ToggleFullScreen = () => {
    ToggleFullscreen();
    Metrics.TrackEvent("FullscreenToggled");
    return false;
  };

  public ShowSettings = () => {
    TutorialSpy("ShowSettings");
    this.tracker.SettingsVisible(true);
    Metrics.TrackEvent("SettingsOpened");
  };

  public ToggleToolbarWidth = () => {
    this.tracker.ToolbarWide(!this.tracker.ToolbarWide());
  };

  public DisplayRoundCounter = ko.pureComputed(
    () => CurrentSettings().TrackerView.DisplayRoundCounter
  );
  public DisplayTurnTimer = ko.pureComputed(
    () => CurrentSettings().TrackerView.DisplayTurnTimer
  );
  public DisplayDifficulty = ko.pureComputed(
    () => CurrentSettings().TrackerView.DisplayDifficulty
  );

  private rollInitiative = () => {
    this.tracker.PromptQueue.AddLegacyPrompt(
      new InitiativePrompt(
        this.tracker.Encounter.Combatants(),
        this.tracker.Encounter.EncounterFlow.StartEncounter
      )
    );
  };

  public StartEncounter = () => {
    if (this.tracker.Encounter.Combatants().length == 0) {
      this.tracker.EventLog.AddEvent("Cannot start empty encounter.");
      return;
    }

    this.HideLibraries();

    if (this.tracker.Encounter.EncounterFlow.State() == "active") {
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
    if (this.tracker.Encounter.EncounterFlow.State() == "inactive") {
      return;
    }

    this.tracker.Encounter.EncounterFlow.EndEncounter();
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
      this.tracker.CombatantCommander.Deselect();
      this.tracker.EventLog.AddEvent("All combatants removed from encounter.");
      Metrics.TrackEvent("EncounterCleared");
    }

    return false;
  };

  public CleanEncounter = () => {
    if (confirm("Remove NPCs and end encounter?")) {
      const npcViewModels = this.tracker
        .OrderedCombatants()
        .filter(c => !c.Combatant.IsPlayerCharacter());
      this.tracker.CombatantCommander.Deselect();
      this.tracker.Encounter.EncounterFlow.EndEncounter();
      npcViewModels.forEach(vm =>
        this.tracker.Encounter.RemoveCombatant(vm.Combatant)
      );
      this.tracker.Encounter.CombatantCountsByName({});
      Metrics.TrackEvent("EncounterCleaned");
    }

    return false;
  };

  public RestoreAllPlayerCharacterHP = () => {
    const playerCharacters = this.tracker.Encounter.Combatants().filter(c =>
      c.IsPlayerCharacter()
    );
    playerCharacters.forEach(pc => pc.CurrentHP(pc.MaxHP()));
    this.tracker.EventLog.AddEvent("All player character HP was restored.");
    Metrics.TrackEvent("AllPlayerCharacterHPRestored");
  };

  public LoadEncounter = (legacySavedEncounter: {}) => {
    const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);
    const nonPlayerCombatants = savedEncounter.Combatants.filter(
      c => c.StatBlock.Player != "player"
    );
    nonPlayerCombatants.forEach(this.tracker.Encounter.AddCombatantFromState);
    Metrics.TrackEvent("EncounterLoaded", {
      Name: savedEncounter.Name,
      Combatants: nonPlayerCombatants.map(c => c.StatBlock.Name)
    });
  };

  public NextTurn = () => {
    if (this.tracker.Encounter.EncounterFlow.State() != "active") {
      this.StartEncounter();
      return;
    }

    if (this.tracker.Encounter.Combatants().length == 0) {
      return;
    }

    if (!this.tracker.Encounter.EncounterFlow.ActiveCombatant()) {
      this.tracker.Encounter.EncounterFlow.ActiveCombatant(
        this.tracker.Encounter.Combatants()[0]
      );
      return;
    }

    const turnEndCombatant = this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    if (turnEndCombatant) {
      Metrics.TrackEvent("TurnCompleted", {
        Name: turnEndCombatant.DisplayName()
      });
    }

    this.tracker.Encounter.EncounterFlow.NextTurn(this.RerollInitiative);

    const turnStartCombatant = this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Start of turn for ${turnStartCombatant.DisplayName()}.`
    );

    return false;
  };

  public PreviousTurn = () => {
    if (!this.tracker.Encounter.EncounterFlow.ActiveCombatant()) {
      return;
    }

    this.tracker.Encounter.EncounterFlow.PreviousTurn();
    let currentCombatant = this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Initiative rewound to ${currentCombatant.DisplayName()}.`
    );

    return false;
  };
}
