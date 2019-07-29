import * as ko from "knockout";
import * as React from "react";

import { find } from "lodash";
import { TagState } from "../common/CombatantState";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { Settings } from "../common/Settings";
import { StatBlock } from "../common/StatBlock";
import { Omit } from "../common/Toolbox";
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
import { PendingPrompts } from "./Commands/Prompts/components/PendingPrompts";
import { Toolbar } from "./Commands/components/Toolbar";
import { Encounter } from "./Encounter/Encounter";
import { UpdateLegacyEncounterState } from "./Encounter/UpdateLegacySavedEncounter";
import { env } from "./Environment";
import { LibraryPanes } from "./Library/Components/LibraryPanes";
import { Libraries } from "./Library/Libraries";
import { PatreonPost } from "./Patreon/PatreonPost";
import { PlayerViewClient } from "./Player/PlayerViewClient";
import { DefaultRules } from "./Rules/Rules";
import {
  AddMissingCommandsAndSaveSettings,
  CurrentSettings,
  SubscribeCommandsToSettingsChanges,
  UpdateSettings
} from "./Settings/Settings";
import { SettingsPane } from "./Settings/components/SettingsPane";
import { SpellEditor } from "./StatBlockEditor/SpellEditor";
import {
  StatBlockEditor,
  StatBlockEditorProps
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

  public TutorialVisible = ko.observable(!Store.Load(Store.User, "SkipIntro"));
  public SettingsVisible = ko.observable(false);
  public LibrariesVisible = ko.observable(true);
  public ToolbarWide = ko.observable(false);

  public DisplayLogin = !env.IsLoggedIn;
  public PatreonLoginUrl = env.PatreonLoginUrl;

  constructor(private Socket: SocketIOClient.Socket) {
    const allCommands = [
      ...this.EncounterToolbar,
      ...this.CombatantCommander.Commands
    ];
    AddMissingCommandsAndSaveSettings(CurrentSettings(), allCommands);
    SubscribeCommandsToSettingsChanges(allCommands);

    this.subscribeToSocketMessages();

    this.joinPlayerViewEncounter();

    this.getAccountOrSampleCharacters();

    this.loadAutoSavedEncounterIfAvailable();

    this.showPrivacyNotificationAfterTutorial();

    Metrics.TrackLoad();
  }

  public ReviewPrivacyPolicy = () => {
    this.SettingsVisible(false);
    const prompt = new PrivacyPolicyPrompt();
    this.PromptQueue.AddLegacyPrompt(prompt);
  };

  public StatBlockTextEnricher = new TextEnricher(
    this.CombatantCommander.RollDice,
    this.CombatantCommander.FormattedStaticFormula,
    this.LibrariesCommander.ReferenceSpell,
    this.LibrariesCommander.ReferenceCondition,
    this.Libraries.Spells,
    this.Rules
  );

  public Encounter = new Encounter(
    this.playerViewClient,
    combatantId =>
      this.OrderedCombatants()
        .find((c: CombatantViewModel) => c.Combatant.Id == combatantId)
        .EditInitiative(),
    this.Rules
  );

  public librariesComponent = (
    <LibraryPanes
      librariesCommander={this.LibrariesCommander}
      libraries={this.Libraries}
      statBlockTextEnricher={this.StatBlockTextEnricher}
    />
  );

  public OrderedCombatants: KnockoutComputed<
    CombatantViewModel[]
  > = ko.pureComputed(() =>
    this.Encounter.Combatants().map(this.buildCombatantViewModel)
  );

  public ActiveCombatantDetails = ko.pureComputed(() => {
    const activeCombatant = this.Encounter.EncounterFlow.ActiveCombatant();
    const combatantViewModel = find(
      this.OrderedCombatants(),
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

  public EditStatBlock(props: Omit<StatBlockEditorProps, "onClose">) {
    this.StatBlockEditor(
      <StatBlockEditor {...props} onClose={() => this.StatBlockEditor(null)} />
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

    if (this.Encounter.EncounterFlow.State() == "active") {
      return "show-center-left-right";
    }

    return "show-center-right-left";
  });

  public settingsComponent = ko.pureComputed(() => {
    return (
      <SettingsPane
        settings={CurrentSettings()}
        handleNewSettings={this.saveUpdatedSettings}
        encounterCommands={this.EncounterToolbar}
        combatantCommands={this.CombatantCommander.Commands}
        reviewPrivacyPolicy={this.ReviewPrivacyPolicy}
        repeatTutorial={this.RepeatTutorial}
        closeSettings={() => this.SettingsVisible(false)}
        libraries={this.Libraries}
        accountClient={new AccountClient()}
      />
    );
  });

  public toolbarComponent = ko.pureComputed(() => {
    const commandsToHideById =
      this.Encounter.EncounterFlow.State() == "active"
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

  public PromptsComponent = ko.pureComputed(() => (
    <PendingPrompts
      prompts={this.PromptQueue.GetPrompts()}
      removeResolvedPrompt={this.PromptQueue.RemoveResolvedPrompt}
    />
  ));

  public contextualCommandSuggestion = () => {
    const encounterEmpty = this.Encounter.Combatants().length === 0;
    const librariesVisible = this.LibrariesVisible();
    const encounterActive = this.Encounter.EncounterFlow.State() === "active";

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

  private subscribeToSocketMessages = () => {
    this.Socket.on(
      "suggest damage",
      (
        suggestedCombatantIds: string[],
        suggestedDamage: number,
        suggester: string
      ) => {
        const suggestedCombatants = this.OrderedCombatants().filter(
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
      (
        suggestedCombatantIds: string[],
        suggestedTag: TagState,
        suggester: string
      ) => {
        const suggestedCombatants = this.OrderedCombatants().filter(
          c => suggestedCombatantIds.indexOf(c.Combatant.Id) > -1
        );

        this.CombatantCommander.PromptAcceptSuggestedTag(
          suggestedCombatants[0].Combatant,
          suggestedTag,
          suggester
        );
      }
    );
  };

  private joinPlayerViewEncounter() {
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
  }

  private getAccountOrSampleCharacters() {
    this.accountClient.GetAccount(account => {
      if (!account) {
        if (Store.List(Store.PersistentCharacters).length == 0) {
          this.getAndAddSamplePersistentCharacters("/sample_players.json");
        }
        return;
      }
      this.handleAccountSync(account);
    });
  }

  private getAndAddSamplePersistentCharacters = (url: string) => {
    $.getJSON(url, (json: StatBlock[]) => {
      json.forEach(statBlock => {
        const persistentCharacter = PersistentCharacter.Initialize({
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

  private loadAutoSavedEncounterIfAvailable() {
    const autosavedEncounter = Store.Load(
      Store.AutoSavedEncounters,
      Store.DefaultSavedEncounterId
    );

    if (autosavedEncounter) {
      this.Encounter.LoadEncounterState(
        UpdateLegacyEncounterState(autosavedEncounter),
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
      this.PromptQueue.AddLegacyPrompt,
      this.EventLog.AddEvent
    );
    return vm;
  };

  private handleAccountSync(account: Account) {
    if (account.settings && account.settings.Version) {
      const updatedSettings = UpdateSettings(account.settings);
      const allCommands = [
        ...this.EncounterToolbar,
        ...this.CombatantCommander.Commands
      ];
      AddMissingCommandsAndSaveSettings(updatedSettings, allCommands);
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

    this.accountClient.SaveAllUnsyncedItems(this.Libraries, () => {});
  }

  private displayPrivacyNotificationIfNeeded = () => {
    if (Store.Load(Store.User, "AllowTracking") == null) {
      this.ReviewPrivacyPolicy();
    }
  };

  private saveUpdatedSettings(newSettings: Settings) {
    CurrentSettings(newSettings);
    Metrics.TrackEvent("SettingsSaved", newSettings);
    Store.Save(Store.User, "Settings", newSettings);
    new AccountClient().SaveSettings(newSettings);
  }
}
