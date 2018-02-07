import { Account } from "./Account/Account";
import { AccountClient } from "./Account/AccountClient";
import { Combatant } from "./Combatant/Combatant";
import { CombatantViewModel } from "./Combatant/CombatantViewModel";
import { CombatantCommander } from "./Commands/CombatantCommander";
import { EncounterCommander } from "./Commands/EncounterCommander";
import { PromptQueue } from "./Commands/Prompts/PromptQueue";
import { Encounter } from "./Encounter/Encounter";
import { env } from "./Environment";
import { Libraries } from "./Library/Libraries";
import { PlayerViewClient } from "./Player/PlayerViewClient";
import { ConfigureCommands, CurrentSettings } from "./Settings/Settings";
import { SpellEditor } from "./StatBlockEditor/SpellEditor";
import { StatBlockEditor } from "./StatBlockEditor/StatBlockEditor";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";
import { EventLog } from "./Widgets/EventLog";

interface PatreonPostAttributes {
    title: string;
    content: string;
    url: string;
    created_at: string;
    was_posted_by_campaign_owner: boolean;
}

interface PatreonPost {
    attributes: PatreonPostAttributes;
    id: string;
    type: string;
}

export class TrackerViewModel {
    constructor() {
        ConfigureCommands([...this.EncounterCommander.Commands, ...this.CombatantCommander.Commands]);
        
        this.Socket.on("suggest damage", (suggestedCombatantIds: string[], suggestedDamage: number, suggester: string) => {
            const suggestedCombatants = this.CombatantViewModels().filter(c => suggestedCombatantIds.indexOf(c.Combatant.Id) > -1);
            this.CombatantCommander.SuggestEditHP(suggestedCombatants, suggestedDamage, suggester);
        });

        const playerViewClient = new PlayerViewClient(this.Socket);
        playerViewClient.JoinEncounter(this.Encounter.EncounterId);
        playerViewClient.UpdateEncounter(this.Encounter.EncounterId, this.Encounter.SavePlayerDisplay());
        playerViewClient.UpdateSettings(this.Encounter.EncounterId, CurrentSettings().PlayerView);
        CurrentSettings.subscribe(v => {
            playerViewClient.UpdateSettings(this.Encounter.EncounterId, v.PlayerView);
        });

        this.AccountClient.GetAccount(account => {
            if (!account) {
                return;
            }

            this.HandleAccountSync(account);
        });

        Metrics.TrackLoad();
    }

    private HandleAccountSync(account: Account) {
        if (account.settings && account.settings.Version) {
            CurrentSettings(account.settings);
        }

        if (account.statblocks) {
            this.Libraries.NPCs.AddStatBlockListings(account.statblocks, "account");
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

    public Socket = io();

    public PromptQueue = new PromptQueue();
    public EventLog = new EventLog();
    public Libraries = new Libraries();
    public StatBlockEditor = new StatBlockEditor();
    public SpellEditor = new SpellEditor();
    public EncounterCommander = new EncounterCommander(this);
    public CombatantCommander = new CombatantCommander(this);
    public AccountClient = new AccountClient();

    public CombatantViewModels = ko.observableArray<CombatantViewModel>([]);

    private addCombatantViewModel = (combatant: Combatant) => {
        const vm = new CombatantViewModel(combatant, this.CombatantCommander, this.PromptQueue.Add, this.EventLog.AddEvent);
        this.CombatantViewModels.push(vm);
        return vm;
    }

    private removeCombatantViewModels = (viewModels: CombatantViewModel []) => {
        this.CombatantViewModels.removeAll(viewModels);
    }

    public Encounter = new Encounter(
        this.PromptQueue,
        this.Socket,
        this.addCombatantViewModel,
        this.removeCombatantViewModels
    );

    public OrderedCombatants = ko.computed(() =>
        this.CombatantViewModels().sort(
            (c1, c2) => this.Encounter.Combatants.indexOf(c1.Combatant) - this.Encounter.Combatants.indexOf(c2.Combatant)
        )
    );

    public TutorialVisible = ko.observable(!Store.Load(Store.User, "SkipIntro"));
    public SettingsVisible = ko.observable(false);
    public LibrariesVisible = ko.observable(true);
    public ToolbarWide = ko.observable(false);
    public ToolbarClass = ko.pureComputed(() => this.ToolbarWide() ? "toolbar-wide" : "toolbar-narrow");
    public ToolbarWidth = (el: HTMLElement) => {
        if (this.ToolbarWide()) {
            return "";
        } else {
            const width = el.parentElement.offsetWidth + el.offsetWidth - el.clientWidth;
            return width.toString() + "px";
        }
    }

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
        if (encounter) {
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
            return "show-center-right-left";
        }

        if (this.CombatantCommander.HasSelected()) {
            return "show-right-center-left";
        }

        if (this.Encounter.State() == "active") {
            return "show-center-left-right";
        }

        return "show-center-right-left";
    });

    private contextualCommandSuggestion = () => {
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
