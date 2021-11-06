import * as ko from "knockout";
import * as React from "react";
import * as SocketIOClient from "socket.io-client";

import * as compression from "json-url";
import { TagState } from "../common/CombatantState";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { Settings } from "../common/Settings";
import { StatBlock } from "../common/StatBlock";
import { Omit, ParseJSONOrDefault } from "../common/Toolbox";
import { AccountClient } from "./Account/AccountClient";
import { Combatant } from "./Combatant/Combatant";
import { CombatantViewModel } from "./Combatant/CombatantViewModel";
import { BuildEncounterCommandList } from "./Commands/BuildEncounterCommandList";
import { CombatantCommander } from "./Commands/CombatantCommander";
import { EncounterCommander } from "./Commands/EncounterCommander";
import { LibrariesCommander } from "./Commands/LibrariesCommander";
import { PrivacyPolicyPrompt } from "./Prompts/PrivacyPolicyPrompt";
import { PromptQueue } from "./Commands/PromptQueue";
import { SubmitButton } from "./Components/Button";
import { Encounter } from "./Encounter/Encounter";
import { UpdateLegacyEncounterState } from "./Encounter/UpdateLegacySavedEncounter";
import { env } from "./Environment";
import { Libraries, LibraryType } from "./Library/Libraries";
import { PatreonPost } from "./Patreon/PatreonPost";
import { PlayerViewClient } from "./PlayerView/PlayerViewClient";
import { DefaultRules } from "./Rules/Rules";
import {
  UpdateLegacyCommandSettingsAndSave,
  CurrentSettings,
  SubscribeCommandsToSettingsChanges
} from "./Settings/Settings";
import { StatBlockEditorProps } from "./StatBlockEditor/StatBlockEditor";
import { TextEnricher } from "./TextEnricher/TextEnricher";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { Metrics } from "./Utility/Metrics";
import { EventLog } from "./Widgets/EventLog";
import { SpellEditorProps } from "./StatBlockEditor/SpellEditor";
import axios from "axios";

const codec = compression("lzma");

export class TrackerViewModel {
  private rules = new DefaultRules();

  public PlayerViewClient = new PlayerViewClient(this.Socket);
  public PromptQueue = new PromptQueue();
  public EventLog = new EventLog();
  public Libraries: Libraries;
  public EncounterCommander = new EncounterCommander(this);
  public CombatantCommander = new CombatantCommander(this);
  public LibrariesCommander = new LibrariesCommander(
    this,
    this.EncounterCommander
  );
  public EncounterToolbar = BuildEncounterCommandList(
    this.EncounterCommander,
    this.LibrariesCommander.SaveEncounter
  );

  public TutorialVisible = ko.observable(
    !LegacySynchronousLocalStore.Load(
      LegacySynchronousLocalStore.User,
      "SkipIntro"
    )
  );
  public SettingsVisible = ko.observable(false);
  public LibrariesVisible = ko.observable(true);
  public LibraryManagerPane = ko.observable<LibraryType | null>(null);
  public ToggleLibraryManager = () => {
    if (this.LibraryManagerPane() === null) {
      this.LibraryManagerPane("StatBlocks");
    } else {
      this.LibraryManagerPane(null);
    }
  };
  public ToolbarWide = ko.observable(false);

  constructor(private Socket: SocketIOClient.Socket) {
    const allCommands = [
      ...this.EncounterToolbar,
      ...this.CombatantCommander.Commands
    ];
    UpdateLegacyCommandSettingsAndSave(CurrentSettings(), allCommands);
    SubscribeCommandsToSettingsChanges(allCommands);

    this.subscribeToSocketMessages();

    this.joinPlayerViewEncounter();

    this.showPrivacyNotificationAfterTutorial();

    Metrics.TrackLoad();
  }

  public SetLibraries = (libraries: Libraries) => {
    // I don't like this pattern, but it's my first stab at a partial
    // conversion to allow an observable-backed class to also depend
    // on a React hook. This will probably catch fire at some point.
    // It's also probably impossible to test.
    this.Libraries = libraries;

    this.StatBlockTextEnricher = new TextEnricher(
      this.CombatantCommander.RollDice,
      this.LibrariesCommander.ReferenceSpell,
      this.LibrariesCommander.ReferenceCondition,
      this.Libraries.Spells.GetAllListings,
      this.LibrariesCommander.GetSpellsByNameRegex,
      this.rules
    );

    this.LibrariesCommander.SetLibraries(libraries);
  };

  public StatBlockTextEnricher: TextEnricher;

  public Encounter = new Encounter(
    this.PlayerViewClient,
    combatantId => {
      const combatant = this.CombatantViewModels().find(
        (c: CombatantViewModel) => c.Combatant.Id == combatantId
      );
      if (combatant) {
        combatant.EditInitiative();
      }
    },
    this.rules
  );

  public CombatantViewModels: ko.PureComputed<
    CombatantViewModel[]
  > = ko.pureComputed(() =>
    this.Encounter.Combatants().map(this.buildCombatantViewModel)
  );

  public StatBlockEditorProps = ko.observable<StatBlockEditorProps>(null);
  public SpellEditorProps = ko.observable<SpellEditorProps>(null);

  public CloseSettings = () => {
    this.SettingsVisible(false);
    //this.TutorialVisible(false);
  };

  public ReviewPrivacyPolicy = () => {
    this.SettingsVisible(false);
    const prompt = PrivacyPolicyPrompt();
    this.PromptQueue.Add(prompt);
  };

  public EditStatBlock(props: Omit<StatBlockEditorProps, "onClose">) {
    this.StatBlockEditorProps({
      ...props,
      onClose: () => this.StatBlockEditorProps(null)
    });
  }

  public EditSpell(props: Omit<SpellEditorProps, "onClose">) {
    this.SpellEditorProps({
      ...props,
      onClose: () => this.SpellEditorProps(null)
    });
  }

  public async EditPersistentCharacterStatBlock(
    persistentCharacterId: string,
    newStatBlock?: StatBlock
  ) {
    this.StatBlockEditorProps(null);
    const persistentCharacterListing = await this.Libraries.PersistentCharacters.GetOrCreateListingById(
      persistentCharacterId
    );

    const persistentCharacter = await persistentCharacterListing.GetWithTemplate(
      PersistentCharacter.Default()
    );

    const hpDown =
      persistentCharacter.StatBlock.HP.Value - persistentCharacter.CurrentHP;

    this.StatBlockEditorProps({
      statBlock: newStatBlock || persistentCharacter.StatBlock,
      editorTarget: "persistentcharacter",
      onSave: (statBlock: StatBlock) =>
        this.LibrariesCommander.UpdatePersistentCharacterStatBlockInLibraryAndEncounter(
          persistentCharacterId,
          statBlock,
          hpDown
        ),
      onDelete: () =>
        this.Libraries.PersistentCharacters.DeleteListing(
          persistentCharacterId
        ),
      onClose: () => this.StatBlockEditorProps(null),
      currentListings: this.Libraries.PersistentCharacters.GetAllListings()
    });
  }

  public RepeatTutorial = () => {
    this.Encounter.EncounterFlow.EndEncounter();
    this.EncounterCommander.ShowLibraries();
    this.SettingsVisible(false);
    this.TutorialVisible(true);
  };

  public ImportEncounterIfAvailable = () => {
    const encounter = env.PostedEncounter;
    if (encounter) {
      this.TutorialVisible(false);
      this.Encounter.ClearEncounter();
      this.Encounter.ImportEncounter(encounter);
    }
  };

  public ImportStatBlockIfAvailable = () => {
    if (!URLSearchParams) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const compressedStatBlockJSON = urlParams.get("s");
    if (!compressedStatBlockJSON) {
      return;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    this.TutorialVisible(false);

    if (!env.HasEpicInitiative) {
      this.PromptQueue.Add({
        autoFocusSelector: ".submit",
        initialValues: {},
        onSubmit: () => true,
        children: (
          <span className="no-epic-initiative-for-import">
            {"The D&D Beyond StatBlock Importer is available for "}
            <a
              href={
                "https://www.patreon.com/join/improvedinitiative/checkout" +
                "?rid=1937132&amp;redirect_uri=%2Fposts%2F31705918"
              }
              target="_blank"
            >
              Epic Initiative
            </a>
            {" Patrons."}
            <SubmitButton />
          </span>
        )
      });

      return;
    }

    codec.decompress(compressedStatBlockJSON).then(json => {
      const parsedStatBlock = ParseJSONOrDefault(json, {});
      const statBlock: StatBlock = {
        ...StatBlock.Default(),
        ...parsedStatBlock
      };

      Metrics.TrackEvent("StatBlockImported", {
        Name: statBlock.Name
      });

      if (statBlock.Player == "") {
        this.EditStatBlock({
          editorTarget: "library",
          onSave: this.Libraries.StatBlocks.SaveNewListing,
          statBlock,
          currentListings: this.Libraries.StatBlocks.GetAllListings()
        });
      } else {
        const currentListings = this.Libraries.PersistentCharacters.GetAllListings();
        const existingListing = currentListings.find(
          l => l.Meta().Name == statBlock.Name
        );
        if (existingListing) {
          this.EditPersistentCharacterStatBlock(
            existingListing.Meta().Id,
            statBlock
          );
        } else {
          this.EditStatBlock({
            editorTarget: "persistentcharacter",
            onSave: statBlock => {
              const persistentCharacter = PersistentCharacter.Initialize(
                statBlock
              );
              this.Libraries.PersistentCharacters.SaveNewListing(
                persistentCharacter
              );
            },
            statBlock,
            currentListings
          });
        }
      }
    });
  };

  public GetWhatsNewIfAvailable = () => {
    axios.get<PatreonPost>("/whatsnew/").then(response => {
      const latestPost = response.data;
      this.EventLog.AddEvent(
        `Welcome to Improved Initiative! Here's what's new: <a href="${latestPost.attributes.url}" target="_blank">${latestPost.attributes.title}</a>`
      );
    });
  };

  private subscribeToSocketMessages = () => {
    this.Socket.on(
      "suggest damage",
      (
        suggestedCombatantIds: string[],
        suggestedDamage: number,
        suggester: string
      ) => {
        const suggestedCombatants = this.CombatantViewModels().filter(
          c => suggestedCombatantIds.indexOf(c.Combatant.Id) > -1
        );
        this.CombatantCommander.PromptAcceptSuggestedDamage(
          suggestedCombatants,
          suggestedDamage,
          suggester
        );
      }
    );

    this.Socket.on(
      "suggest tag",
      (suggestedCombatantIds: string[], suggestedTag: TagState) => {
        const suggestedCombatants = this.CombatantViewModels().filter(
          c => suggestedCombatantIds.indexOf(c.Combatant.Id) > -1
        );

        this.CombatantCommander.PromptAcceptSuggestedTag(
          suggestedCombatants[0].Combatant,
          suggestedTag
        );
      }
    );
  };

  private joinPlayerViewEncounter() {
    this.PlayerViewClient.JoinEncounter(env.EncounterId);

    this.PlayerViewClient.UpdateSettings(
      env.EncounterId,
      CurrentSettings().PlayerView
    );

    this.PlayerViewClient.UpdateEncounter(
      env.EncounterId,
      this.Encounter.GetPlayerView()
    );

    CurrentSettings.subscribe(v => {
      this.PlayerViewClient.UpdateSettings(env.EncounterId, v.PlayerView);
      this.PlayerViewClient.UpdateEncounter(
        env.EncounterId,
        this.Encounter.GetPlayerView()
      );
    });
  }

  private didLoadAutosave = false;

  public LoadAutoSavedEncounterIfAvailable() {
    if (this.didLoadAutosave) {
      return;
    }
    this.didLoadAutosave = true;

    const autosavedEncounter = LegacySynchronousLocalStore.Load(
      LegacySynchronousLocalStore.AutoSavedEncounters,
      LegacySynchronousLocalStore.DefaultSavedEncounterId
    );

    if (autosavedEncounter) {
      const updatedState = UpdateLegacyEncounterState(autosavedEncounter);

      this.Encounter.LoadEncounterState(
        updatedState,
        this.LibrariesCommander.UpdatePersistentCharacter,
        this.Libraries.PersistentCharacters
      );
    }

    this.Encounter.StartEncounterAutosaves();
  }

  private showPrivacyNotificationAfterTutorial() {
    this.TutorialVisible.subscribe(v => {
      if (v == false) {
        this.displayPrivacyNotificationIfNeeded();
      }
    });
  }

  private buildCombatantViewModel = (combatant: Combatant) => {
    const vm = new CombatantViewModel(
      combatant,
      this.CombatantCommander,
      this.PromptQueue.Add,
      this.EventLog.AddEvent
    );
    return vm;
  };

  private displayPrivacyNotificationIfNeeded = () => {
    if (
      LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      ) == null
    ) {
      this.ReviewPrivacyPolicy();
    }
  };

  public SaveUpdatedSettings(newSettings: Settings) {
    CurrentSettings(newSettings);
    Metrics.TrackEvent("SettingsSaved", newSettings);
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "Settings",
      newSettings
    );
    new AccountClient().SaveSettings(newSettings);
  }
}
