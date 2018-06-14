import * as ko from "knockout";
import * as React from "react";

import { Account } from "./Account/Account";
import { AccountClient } from "./Account/AccountClient";
import { Combatant } from "./Combatant/Combatant";
import { CombatantViewModel } from "./Combatant/CombatantViewModel";
import { CombatantCommander } from "./Commands/CombatantCommander";
import { BuildEncounterCommandList } from "./Commands/Command";
import { EncounterCommander } from "./Commands/EncounterCommander";
import { LibrariesCommander } from "./Commands/LibrariesCommander";
import { PrivacyPolicyPromptWrapper } from "./Commands/Prompts/PrivacyPolicyPrompt";
import { PromptQueue } from "./Commands/Prompts/PromptQueue";
import { Toolbar } from "./Commands/components/Toolbar";
import { Encounter } from "./Encounter/Encounter";
import { env } from "./Environment";
import { LibrariesViewModel } from "./Library/Components/LibrariesViewModel";
import { Libraries } from "./Library/Libraries";
import { PatreonPost } from "./Patreon/PatreonPost";
import { PlayerViewClient } from "./Player/PlayerViewClient";
import { DefaultRules } from "./Rules/Rules";
import { ConfigureCommands, CurrentSettings } from "./Settings/Settings";
import { SpellEditor } from "./StatBlockEditor/SpellEditor";
import { StatBlockEditor } from "./StatBlockEditor/StatBlockEditor";
import { TextEnricher } from "./TextEnricher/TextEnricher";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";
import { EventLog } from "./Widgets/EventLog";

export class TrackerViewModel {
    constructor(private Socket: SocketIOClient.Socket) {
        ConfigureCommands([...this.EncounterToolbar, ...this.CombatantCommander.Commands]);

        this.Socket.on("suggest damage", (suggestedCombatantIds: string[], suggestedDamage: number, suggester: string) => {
            const suggestedCombatants = this.CombatantViewModels().filter(c => suggestedCombatantIds.indexOf(c.Combatant.Id) > -1);
            this.CombatantCommander.SuggestEditHP(suggestedCombatants, suggestedDamage, suggester);
        });

        this.playerViewClient.JoinEncounter(this.Encounter.EncounterId);
        this.playerViewClient.UpdateEncounter(this.Encounter.EncounterId, this.Encounter.SavePlayerDisplay());
        this.playerViewClient.UpdateSettings(this.Encounter.EncounterId, CurrentSettings().PlayerView);
        CurrentSettings.subscribe(v => {
            this.playerViewClient.UpdateSettings(this.Encounter.EncounterId, v.PlayerView);
        });

        this.accountClient.GetAccount(account => {
            if (!account) {
                return;
            }

            this.HandleAccountSync(account);
        });

        this.displayPrivacyNotificationIfNeeded();

        Metrics.TrackLoad();
    }

    private accountClient = new AccountClient();

    private displayPrivacyNotificationIfNeeded = () => {
        if (Store.Load(Store.User, "AllowTracking") == null) {
            this.ReviewPrivacyPolicy();
        }
    }

    public ReviewPrivacyPolicy = () => {
        this.SettingsVisible(false);
        const prompt = new PrivacyPolicyPromptWrapper();
        this.PromptQueue.Add(prompt);
    }

    private HandleAccountSync(account: Account) {
        if (account.settings && account.settings.Version) {
            CurrentSettings(account.settings);
        }

        if (account.statblocks) {
            this.Libraries.NPCs.AddListings(account.statblocks, "account");
        }

        if (account.playercharacters) {
            this.Libraries.PCs.AddListings(account.playercharacters, "account");
        }

        if (account.spells) {
            this.Libraries.Spells.AddListings(account.spells, "account");
        }

        if (account.encounters) {
            this.Libraries.Encounters.AddListings(account.encounters, "account");
        }
    }

    public PromptQueue = new PromptQueue();
    public EventLog = new EventLog();
    public Libraries = new Libraries(this.accountClient);
    public StatBlockEditor = new StatBlockEditor();
    public SpellEditor = new SpellEditor();
    public EncounterCommander = new EncounterCommander(this);
    public CombatantCommander = new CombatantCommander(this);
    public LibrariesCommander = new LibrariesCommander(this, this.Libraries, this.EncounterCommander);
    public EncounterToolbar = BuildEncounterCommandList(this.EncounterCommander, this.LibrariesCommander.SaveEncounter);

    public CombatantViewModels = ko.observableArray<CombatantViewModel>([]);

    private addCombatantViewModel = (combatant: Combatant) => {
        const vm = new CombatantViewModel(combatant, this.CombatantCommander, this.PromptQueue.Add, this.EventLog.AddEvent);
        this.CombatantViewModels.push(vm);
        return vm;
    }

    private removeCombatantViewModels = (viewModels: CombatantViewModel[]) => {
        this.CombatantViewModels.removeAll(viewModels);
    }

    private playerViewClient = new PlayerViewClient(this.Socket);
    
    public Rules = new DefaultRules();

    public StatBlockTextEnricher = new TextEnricher(
        this.CombatantCommander.RollDice,
        this.LibrariesCommander.ReferenceSpell,
        this.LibrariesCommander.ReferenceCondition,
        this.Libraries.Spells,
        this.Rules);
    
    public Encounter = new Encounter(
        this.PromptQueue,
        this.playerViewClient,
        this.addCombatantViewModel,
        this.removeCombatantViewModels,
        this.Rules,
        this.StatBlockTextEnricher
    );

    public librariesComponent = React.createElement(LibrariesViewModel, {
        librariesCommander: this.LibrariesCommander,
        libraries: this.Libraries,
        statBlockTextEnricher: this.StatBlockTextEnricher
    });

    public OrderedCombatants = ko.computed(() =>
        this.CombatantViewModels().sort(
            (c1, c2) => this.Encounter.Combatants.indexOf(c1.Combatant) - this.Encounter.Combatants.indexOf(c2.Combatant)
        )
    );

    public TutorialVisible = ko.observable(!Store.Load(Store.User, "SkipIntro"));
    public SettingsVisible = ko.observable(false);
    public LibrariesVisible = ko.observable(true);
    public ToolbarWide = ko.observable(false);

    public DisplayLogin = !env.IsLoggedIn;

    public CenterColumn = ko.pureComputed(() => {
        const editStatBlock = this.StatBlockEditor.HasStatBlock();
        const editSpell = this.SpellEditor.HasSpell();
        if (editStatBlock) {
            return "statblockeditor";
        }
        if (editSpell) {
            return "spelleditor";
        }
        return "combat";
    });

    public BlurVisible = ko.pureComputed(() =>
        this.TutorialVisible() ||
        this.SettingsVisible()
    );

    public CloseSettings = () => {
        this.SettingsVisible(false);
        //this.TutorialVisible(false);
    }

    public RepeatTutorial = () => {
        this.Encounter.EndEncounter();
        this.EncounterCommander.ShowLibraries();
        this.SettingsVisible(false);
        this.TutorialVisible(true);
    }

    public ImportEncounterIfAvailable = () => {
        const encounter = env.PostedEncounter;
        if (encounter && this.Encounter.Combatants().length === 0) {
            this.TutorialVisible(false);
            this.Encounter.ImportEncounter(encounter);
        }
    }

    public GetWhatsNewIfAvailable = () => {
        $.getJSON("/whatsnew/")
            .done((latestPost: PatreonPost) => {
                this.EventLog.AddEvent(`Welcome to Improved Initiative! Here's what's new: <a href="${latestPost.attributes.url}" target="_blank">${latestPost.attributes.title}</a>`);
            });
    }

    public PatreonLoginUrl = env.PatreonLoginUrl;

    public InterfacePriority = ko.pureComputed(() => {
        if (this.CenterColumn() === "statblockeditor" || this.CenterColumn() === "spelleditor") {
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

    public toolbarComponent = ko.computed(() => {
        const commandsToHideByDescription = this.Encounter.State() == "active" ?
            ["Start Encounter"] :
            ["Reroll Initiative", "End Encounter", "Next Turn", "Previous Turn"];

        return React.createElement(Toolbar,
            {
                encounterCommands: this.EncounterToolbar.filter(c => c.ShowOnActionBar() && !commandsToHideByDescription.some(d => c.Description == d)),
                combatantCommands: this.CombatantCommander.Commands.filter(c => c.ShowOnActionBar()),
                width: this.ToolbarWide() ? "wide" : "narrow",
                showCombatantCommands: this.CombatantCommander.HasSelected()
            });
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
    }
}
