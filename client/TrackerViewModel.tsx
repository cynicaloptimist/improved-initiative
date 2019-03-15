import * as ko from "knockout";
import * as React from "react";

import { find } from "lodash";
import { InitializeCharacter } from "../common/PersistentCharacter";
import { StatBlock } from "../common/StatBlock";
import { Account } from "./Account/Account";
import { AccountClient } from "./Account/AccountClient";
import { Combatant } from "./Combatant/Combatant";
import { CombatantDetails } from "./Combatant/CombatantDetails";
import { CombatantViewModel } from "./Combatant/CombatantViewModel";
import { BuildEncounterCommandList } from "./Commands/BuildEncounterCommandList";
import { CombatantCommander } from "./Commands/CombatantCommander";
import { EncounterCommander } from "./Commands/EncounterCommander";
import { LibrariesCommander } from "./Commands/LibrariesCommander";
import { PrivacyPolicyPrompt } from "./Commands/Prompts/PrivacyPolicyPrompt";
import { PromptQueue } from "./Commands/Prompts/PromptQueue";
import { Toolbar } from "./Commands/components/Toolbar";
import { Encounter } from "./Encounter/Encounter";
import { UpdateLegacySavedEncounter } from "./Encounter/UpdateLegacySavedEncounter";
import { env } from "./Environment";
import { LibrariesViewModel } from "./Library/Components/LibrariesViewModel";
import { Libraries } from "./Library/Libraries";
import { Listing } from "./Library/Listing";
import { PatreonPost } from "./Patreon/PatreonPost";
import { PlayerViewClient } from "./Player/PlayerViewClient";
import { DefaultRules } from "./Rules/Rules";
import {
  ConfigureCommands,
  CurrentSettings,
  Settings
} from "./Settings/Settings";
import { SettingsPane } from "./Settings/components/SettingsPane";
import { SpellEditor } from "./StatBlockEditor/SpellEditor";
import {
  StatBlockEditor,
  StatBlockEditorTarget
} from "./StatBlockEditor/StatBlockEditor";
import { TextEnricher } from "./TextEnricher/TextEnricher";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";
import { EventLog } from "./Widgets/EventLog";

export class TrackerViewModel {
  private accountClient = new AccountClient();
  private playerViewClient = new PlayerViewClient(this.Socket);

  public Rules = new DefaultRules();
  public PromptQueue = new PromptQueue();
  public EventLog = new EventLog();
  public Libraries = new Libraries(this.accountClient);
  public SpellEditor = new SpellEditor();
  public EncounterCommander = new EncounterCommander(this);
  public CombatantCommander = new CombatantCommander(this);
  public LibrariesCommander = new LibrariesCommander(
    this,
    this.Libraries,
    this.EncounterCommander
  );
  public EncounterToolbar = BuildEncounterCommandList(
    this.EncounterCommander,
    this.LibrariesCommander.SaveEncounter
  );

  public CombatantViewModels = ko.observableArray<CombatantViewModel>([]);
  public TutorialVisible = ko.observable(!Store.Load(Store.User, "SkipIntro"));
  public SettingsVisible = ko.observable(false);
  public LibrariesVisible = ko.observable(true);
  public ToolbarWide = ko.observable(false);

  public DisplayLogin = !env.IsLoggedIn;
  public PatreonLoginUrl = env.PatreonLoginUrl;

  constructor(private Socket: SocketIOClient.Socket) {
    ConfigureCommands([
      ...this.EncounterToolbar,
      ...this.CombatantCommander.Commands
    ]);

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
        this.CombatantCommander.SuggestEditHP(
          suggestedCombatants,
          suggestedDamage,
          suggester
        );
      }
    );

    this.playerViewClient.JoinEncounter(this.Encounter.EncounterId);
    this.playerViewClient.UpdateSettings(
      this.Encounter.EncounterId,
      CurrentSettings().PlayerView
    );
    this.playerViewClient.UpdateEncounter(
      this.Encounter.EncounterId,
      this.Encounter.GetPlayerView()
    );
    CurrentSettings.subscribe(v => {
      this.playerViewClient.UpdateSettings(
        this.Encounter.EncounterId,
        v.PlayerView
      );
      this.playerViewClient.UpdateEncounter(
        this.Encounter.EncounterId,
        this.Encounter.GetPlayerView()
      );
    });

    this.accountClient.GetAccount(account => {
      if (!account) {
        if (Store.List(Store.PersistentCharacters).length == 0) {
          this.getAndAddSamplePersistentCharacters("/sample_players.json");
        }
        return;
      }

      this.HandleAccountSync(account);
    });

    const autosavedEncounter = Store.Load(
      Store.AutoSavedEncounters,
      Store.DefaultSavedEncounterId
    );
    if (autosavedEncounter) {
      this.Encounter.LoadEncounterState(
        UpdateLegacySavedEncounter(autosavedEncounter),
        this.Libraries.PersistentCharacters
      );
    }

    this.TutorialVisible.subscribe(v => {
      if (v == false) {
        this.displayPrivacyNotificationIfNeeded();
      }
    });

    Metrics.TrackLoad();
  }

  private getAndAddSamplePersistentCharacters = (url: string) => {
    $.getJSON(url, (json: StatBlock[]) => {
      json.forEach(statBlock => {
        const persistentCharacter = InitializeCharacter({
          ...StatBlock.Default(),
          ...statBlock
        });
        persistentCharacter.Path = "Sample Player Characters";
        this.Libraries.PersistentCharacters.AddNewPersistentCharacter(
          persistentCharacter
        );
      });
    });
  };

  public ReviewPrivacyPolicy = () => {
    this.SettingsVisible(false);
    const prompt = new PrivacyPolicyPrompt();
    this.PromptQueue.Add(prompt);
  };

  public StatBlockTextEnricher = new TextEnricher(
    this.CombatantCommander.RollDice,
    this.LibrariesCommander.ReferenceSpell,
    this.LibrariesCommander.ReferenceCondition,
    this.Libraries.Spells,
    this.Rules
  );

  private initializeCombatantViewModel = (combatant: Combatant) => {
    const vm = new CombatantViewModel(
      combatant,
      this.CombatantCommander,
      this.PromptQueue.Add,
      this.EventLog.AddEvent
    );
    this.CombatantViewModels.push(vm);
    return vm;
  };

  private removeCombatantViewModels = (viewModels: CombatantViewModel[]) => {
    this.CombatantViewModels.removeAll(viewModels);
  };

  public Encounter = new Encounter(
    this.playerViewClient,
    this.initializeCombatantViewModel,
    this.removeCombatantViewModels,
    this.Rules
  );

  public librariesComponent = (
    <LibrariesViewModel
      librariesCommander={this.LibrariesCommander}
      libraries={this.Libraries}
      statBlockTextEnricher={this.StatBlockTextEnricher}
    />
  );

  public OrderedCombatants = ko.computed(() =>
    this.CombatantViewModels().sort(
      (c1, c2) =>
        this.Encounter.Combatants().indexOf(c1.Combatant) -
        this.Encounter.Combatants().indexOf(c2.Combatant)
    )
  );

  public ActiveCombatantDetails = ko.computed(() => {
    const activeCombatant = this.Encounter.ActiveCombatant();
    const combatantViewModel = find(
      this.CombatantViewModels(),
      c => c.Combatant == activeCombatant
    );
    return (
      <CombatantDetails
        combatantViewModel={combatantViewModel}
        displayMode="active"
        enricher={this.StatBlockTextEnricher}
      />
    );
  });

  public CenterColumn = ko.pureComputed(() => {
    const editStatBlock = this.StatBlockEditor() !== null;
    const editSpell = this.SpellEditor.HasSpell();
    if (editStatBlock) {
      return "statblockeditor";
    }
    if (editSpell) {
      return "spelleditor";
    }
    return "combat";
  });

  public BlurVisible = ko.pureComputed(
    () => this.TutorialVisible() || this.SettingsVisible()
  );

  public CloseSettings = () => {
    this.SettingsVisible(false);
    //this.TutorialVisible(false);
  };

  public EditStatBlock(
    editorTarget: StatBlockEditorTarget,
    statBlock: StatBlock,
    saveCallback: (newStatBlock: StatBlock) => void,
    currentListings?: Listing<StatBlock>[],
    deleteCallback?: () => void,
    saveAsCallback?: (newStatBlock: StatBlock) => void
  ) {
    this.StatBlockEditor(
      <StatBlockEditor
        statBlock={statBlock}
        editorTarget={editorTarget}
        onSave={saveCallback}
        onDelete={deleteCallback}
        onSaveAs={saveAsCallback}
        onClose={() => this.StatBlockEditor(null)}
        currentListings={currentListings}
      />
    );
  }

  public async EditPersistentCharacterStatBlock(persistentCharacterId: string) {
    this.StatBlockEditor(null);
    const persistentCharacter = await this.Libraries.PersistentCharacters.GetPersistentCharacter(
      persistentCharacterId
    );
    const hpDown =
      persistentCharacter.StatBlock.HP.Value - persistentCharacter.CurrentHP;

    this.StatBlockEditor(
      <StatBlockEditor
        statBlock={persistentCharacter.StatBlock}
        editorTarget="persistentcharacter"
        onSave={(statBlock: StatBlock) => {
          this.Libraries.PersistentCharacters.UpdatePersistentCharacter(
            persistentCharacterId,
            {
              StatBlock: statBlock,
              CurrentHP: statBlock.HP.Value - hpDown
            }
          );
          this.Encounter.UpdatePersistentCharacterStatBlock(
            persistentCharacterId,
            statBlock
          );
        }}
        onDelete={() =>
          this.Libraries.PersistentCharacters.DeletePersistentCharacter(
            persistentCharacterId
          )
        }
        onClose={() => this.StatBlockEditor(null)}
        currentListings={this.Libraries.PersistentCharacters.GetListings()}
      />
    );
  }

  protected StatBlockEditor = ko.observable<JSX.Element>(null);

  public RepeatTutorial = () => {
    this.Encounter.EndEncounter();
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

  public GetWhatsNewIfAvailable = () => {
    $.getJSON("/whatsnew/").done((latestPost: PatreonPost) => {
      this.EventLog.AddEvent(
        `Welcome to Improved Initiative! Here's what's new: <a href="${
          latestPost.attributes.url
        }" target="_blank">${latestPost.attributes.title}</a>`
      );
    });
  };

  public InterfacePriority = ko.pureComputed(() => {
    if (
      this.CenterColumn() === "statblockeditor" ||
      this.CenterColumn() === "spelleditor"
    ) {
      if (this.LibrariesVisible()) {
        return "show-center-left-right";
      }
      return "show-center-right-left";
    }

    if (this.LibrariesVisible()) {
      return "show-left-center-right";
    }

    if (this.PromptQueue.HasPrompt()) {
      if (this.CombatantCommander.HasSelected()) {
        return "show-center-right-left";
      }
      return "show-center-left-right";
    }

    if (this.CombatantCommander.HasSelected()) {
      return "show-right-center-left";
    }

    if (this.Encounter.State() == "active") {
      return "show-center-left-right";
    }

    return "show-center-right-left";
  });

  public settingsComponent = ko.computed(() => {
    const encounterCommands = this.EncounterToolbar;
    const combatantCommander = this.CombatantCommander;
    return (
      <SettingsPane
        settings={CurrentSettings()}
        handleNewSettings={this.saveUpdatedSettings}
        reviewPrivacyPolicy={this.ReviewPrivacyPolicy}
        repeatTutorial={this.RepeatTutorial}
        saveAndClose={() => this.SettingsVisible(false)}
        libraries={this.Libraries}
        accountClient={new AccountClient()}
      />
    );
  });

  public toolbarComponent = ko.computed(() => {
    const commandsToHideById =
      this.Encounter.State() == "active"
        ? ["start-encounter"]
        : ["reroll-initiative", "end-encounter", "next-turn", "previous-turn"];

    const onePersistentCharacterSelected =
      this.CombatantCommander.HasOneSelected() &&
      this.CombatantCommander.SelectedCombatants()[0].Combatant
        .PersistentCharacterId != null;
    if (!onePersistentCharacterSelected) {
      commandsToHideById.push("update-notes");
    }

    const encounterCommands = this.EncounterToolbar.filter(
      c => c.ShowOnActionBar() && !commandsToHideById.some(d => c.Id == d)
    );
    const combatantCommands = this.CombatantCommander.Commands.filter(
      c => c.ShowOnActionBar() && !commandsToHideById.some(d => c.Id == d)
    );

    return (
      <Toolbar
        encounterCommands={encounterCommands}
        combatantCommands={combatantCommands}
        width={this.ToolbarWide() ? "wide" : "narrow"}
        showCombatantCommands={this.CombatantCommander.HasSelected()}
      />
    );
  });

  public contextualCommandSuggestion = () => {
    const encounterEmpty = this.Encounter.Combatants().length === 0;
    const librariesVisible = this.LibrariesVisible();
    const encounterActive = this.Encounter.State() === "active";

    if (encounterEmpty) {
      if (librariesVisible) {
        //No creatures, Library open: Creature listing
        return "listing";
      } else {
        //No creatures, library closed: Add Creatures
        return "add-creatures";
      }
    }

    if (!encounterActive) {
      //Creatures, encounter stopped: Start Encounter
      return "start-encounter";
    }

    if (librariesVisible) {
      //Creatures, library open, encounter active: Hide Libraries
      return "hide-libraries";
    }

    //Creatures, library closed, encounter active: Next turn
    return "next-turn";
  };

  private HandleAccountSync(account: Account) {
    if (account.settings && account.settings.Version) {
      CurrentSettings(account.settings);
    }

    if (account.statblocks) {
      this.Libraries.NPCs.AddListings(account.statblocks, "account");
    }

    if (account.persistentcharacters) {
      this.Libraries.PersistentCharacters.AddListings(
        account.persistentcharacters,
        "account"
      );
    }

    if (account.spells) {
      this.Libraries.Spells.AddListings(account.spells, "account");
    }

    if (account.encounters) {
      this.Libraries.Encounters.AddListings(account.encounters, "account");
    }
  }

  private displayPrivacyNotificationIfNeeded = () => {
    if (Store.Load(Store.User, "AllowTracking") == null) {
      this.ReviewPrivacyPolicy();
    }
  };

  private saveUpdatedSettings(newSettings: Settings) {
    CurrentSettings(newSettings);
    Store.Save(Store.User, "Settings", newSettings);
    new AccountClient().SaveSettings(newSettings);
  }
}
