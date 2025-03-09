import * as _ from "lodash";

import { CombatStats } from "../../common/CombatStats";
import { PostCombatStatsOption } from "../../common/Settings";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { env } from "../Environment";
import { CurrentSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { NotifyTutorialOfAction } from "../Tutorial/NotifyTutorialOfAction";
import { Metrics } from "../Utility/Metrics";
import { CombatStatsPrompt } from "../Prompts/CombatStatsPrompt";
import { InitiativePrompt } from "../Prompts/InitiativePrompt";
import { PlayerViewPrompt } from "../Prompts/PlayerViewPrompt";
import { QuickAddPrompt } from "../Prompts/QuickAddPrompt";
import { RollDicePrompt } from "../Prompts/RollDicePrompt";
import { ToggleFullscreen } from "./ToggleFullscreen";
import { PersistentCharacter } from "../../common/PersistentCharacter";

export class EncounterCommander {
  constructor(private tracker: TrackerViewModel) {}

  public QuickAddStatBlock = (): void => {
    const prompt = QuickAddPrompt(
      this.tracker.Encounter.AddCombatantFromStatBlock
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public ShowLibraries = (): void => this.tracker.LibrariesVisible(true);
  public HideLibraries = (): void => this.tracker.LibrariesVisible(false);

  public ToggleLibraryManager = (): void => this.tracker.ToggleLibraryManager();

  public LaunchPlayerView = (): void => {
    const prompt = PlayerViewPrompt(
      env.EncounterId,
      this.tracker.Encounter.TemporaryBackgroundImageUrl() ?? "",
      backgroundImageUrl =>
        this.tracker.Encounter.TemporaryBackgroundImageUrl(backgroundImageUrl),
      this.requestCustomEncounterIdAndUpdateEncounter
    );
    this.tracker.PromptQueue.Add(prompt);

    Metrics.TrackEvent("PlayerViewLaunched", {
      Id: env.EncounterId
    });
  };

  private requestCustomEncounterIdAndUpdateEncounter = async (
    requestedId: string
  ) => {
    const didGrantId =
      await this.tracker.PlayerViewClient.RequestCustomEncounterId(requestedId);

    if (didGrantId) {
      env.EncounterId = requestedId;
      const settings = CurrentSettings();
      settings.PlayerView.CustomEncounterId = requestedId;
      this.tracker.SaveUpdatedSettings(settings);
      this.tracker.PlayerViewClient.UpdateEncounter(
        requestedId,
        this.tracker.Encounter.GetPlayerView()
      );
    }

    return didGrantId;
  };

  public ToggleFullScreen = (): boolean => {
    ToggleFullscreen();
    Metrics.TrackEvent("FullscreenToggled");
    return false;
  };

  public ShowSettings = (): void => {
    NotifyTutorialOfAction("ShowSettings");
    this.tracker.SettingsVisible(true);
    Metrics.TrackEvent("SettingsOpened");
  };

  public ToggleToolbarWidth = (): void => {
    this.tracker.ToolbarWide(!this.tracker.ToolbarWide());
  };

  private ShowInitiativePrompt = (): Promise<void> => {
    return new Promise<void>(done => {
      this.tracker.PromptQueue.Add(
        InitiativePrompt(this.tracker.Encounter.Combatants(), () => {
          this.tracker.Encounter.EncounterFlow.StartEncounter();
          done();
        })
      );
    });
  };

  public StartEncounter = (): boolean => {
    if (this.tracker.Encounter.Combatants().length == 0) {
      this.tracker.EventLog.AddEvent("Cannot start empty encounter.");
      return;
    }

    this.HideLibraries();

    if (this.tracker.Encounter.EncounterFlow.State() == "active") {
      return;
    }

    this.ShowInitiativePrompt();

    NotifyTutorialOfAction("ShowInitiativeDialog");

    this.tracker.EventLog.AddEvent("Encounter started.");
    Metrics.TrackEvent("EncounterStarted", {
      CombatantCount: this.tracker.Encounter.Combatants().length
    });

    return false;
  };

  public EndEncounter = (): boolean => {
    if (this.tracker.Encounter.EncounterFlow.State() == "inactive") {
      return;
    }

    this.tracker.Encounter.EncounterFlow.EndEncounter();
    this.tracker.EventLog.AddEvent("Encounter ended.");
    Metrics.TrackEvent("EncounterEnded", {
      Combatants: this.tracker.Encounter.Combatants().length
    });

    const displayPostCombatStats =
      CurrentSettings().TrackerView.PostCombatStats;

    if (displayPostCombatStats != PostCombatStatsOption.None) {
      const combatTimer = this.tracker.Encounter.EncounterFlow.CombatTimer;

      const combatStats: CombatStats = {
        elapsedRounds: combatTimer.ElapsedRounds(),
        elapsedSeconds: combatTimer.ElapsedSeconds(),
        combatants: this.tracker.Encounter.Combatants()
          .filter(c => c.IsPlayerCharacter())
          .map(c => ({
            displayName: c.DisplayName(),
            elapsedRounds: c.CombatTimer.ElapsedRounds(),
            elapsedSeconds: c.CombatTimer.ElapsedSeconds()
          }))
      };

      if (
        displayPostCombatStats == PostCombatStatsOption.EncounterViewOnly ||
        displayPostCombatStats == PostCombatStatsOption.Both
      ) {
        const combatStatsPrompt = CombatStatsPrompt(combatStats);
        this.tracker.PromptQueue.Add(combatStatsPrompt);
      }

      if (
        displayPostCombatStats == PostCombatStatsOption.PlayerViewOnly ||
        displayPostCombatStats == PostCombatStatsOption.Both
      ) {
        this.tracker.Encounter.DisplayPlayerViewCombatStats(combatStats);
      }
    }

    this.tracker.Encounter.Combatants().forEach(c => c.CombatTimer.Stop());
    this.tracker.Encounter.EncounterFlow.CombatTimer.Stop();

    return false;
  };

  public RerollInitiative = async (): Promise<void> => {
    await this.ShowInitiativePrompt();
    Metrics.TrackEvent("InitiativeRerolled");
  };

  public ClearEncounter = (): boolean => {
    if (confirm("Remove all combatants and end encounter?")) {
      this.tracker.Encounter.ClearEncounter();
      this.tracker.CombatantCommander.Deselect();
      this.tracker.EventLog.AddEvent("All combatants removed from encounter.");
      Metrics.TrackEvent("EncounterCleared");
    }

    return false;
  };

  public CleanEncounter = (): boolean => {
    if (confirm("Remove NPCs and end encounter?")) {
      const npcViewModels = this.tracker
        .CombatantViewModels()
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

  public RestoreAllPlayerCharacterHP = (): void => {
    const playerCharacters = this.tracker.Encounter.Combatants().filter(c =>
      c.IsPlayerCharacter()
    );
    playerCharacters.forEach(pc => pc.CurrentHP(pc.MaxHP()));
    this.tracker.EventLog.AddEvent("All player character HP was restored.");
    Metrics.TrackEvent("AllPlayerCharacterHPRestored");
  };

  public LoadSavedEncounter = async (
    legacySavedEncounter: Record<string, any>
  ): Promise<void[]> => {
    const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);

    const nonCharacterCombatants = savedEncounter.Combatants.filter(
      c => !c.PersistentCharacterId
    );

    const nonCharacterCombatantsInLabelOrder = _.sortBy(
      nonCharacterCombatants,
      c => c.IndexLabel
    );

    nonCharacterCombatantsInLabelOrder.forEach(
      this.tracker.Encounter.AddCombatantFromState
    );

    const persistentCharacters = savedEncounter.Combatants.filter(
      c => c.PersistentCharacterId
    );

    const persistentCharactersPromise = persistentCharacters.map(
      pc =>
        new Promise<void>(async resolve => {
          const persistentCharacterListing =
            await this.tracker.Libraries.PersistentCharacters.GetOrCreateListingById(
              pc.PersistentCharacterId
            );
          const persistentCharacter =
            await persistentCharacterListing.GetWithTemplate(
              PersistentCharacter.Default()
            );
          this.tracker.Encounter.AddCombatantFromPersistentCharacter(
            persistentCharacter,
            this.tracker.LibrariesCommander.UpdatePersistentCharacter
          );
          resolve();
        })
    );

    this.tracker.Encounter.TemporaryBackgroundImageUrl(
      savedEncounter.BackgroundImageUrl
    );

    Metrics.TrackEvent("EncounterLoaded", {
      Name: savedEncounter.Name,
      Combatants: savedEncounter.Combatants.map(c => c.StatBlock.Name)
    });

    return Promise.all(persistentCharactersPromise);
  };

  public NextTurn = async (): Promise<boolean> => {
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

    const turnEndCombatant =
      this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    if (turnEndCombatant) {
      Metrics.TrackEvent("TurnCompleted", {
        Name: turnEndCombatant.DisplayName()
      });
    }

    await this.tracker.Encounter.EncounterFlow.NextTurn(this.RerollInitiative);

    const turnStartCombatant =
      this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Start of turn for ${turnStartCombatant.DisplayName()}.`
    );

    return false;
  };

  public PreviousTurn = (): boolean => {
    if (!this.tracker.Encounter.EncounterFlow.ActiveCombatant()) {
      return;
    }

    this.tracker.Encounter.EncounterFlow.PreviousTurn();
    const currentCombatant =
      this.tracker.Encounter.EncounterFlow.ActiveCombatant();
    this.tracker.EventLog.AddEvent(
      `Initiative rewound to ${currentCombatant.DisplayName()}.`
    );

    return false;
  };

  public PromptRollDice = (): void => {
    this.tracker.PromptQueue.Add(
      RollDicePrompt(this.tracker.CombatantCommander.RollDice)
    );
  };
}
