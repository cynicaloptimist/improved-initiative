module ImprovedInitiative {
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

            this.Socket.emit("join encounter", this.Encounter.EncounterId);

            this.AccountClient.GetAccount(account => {
                if (!account) {
                    return;
                }

                this.HandleAccountSync(account);
            })
        }

        private HandleAccountSync(account: Account) {
            if (account.settings && account.settings.Version) {
                CurrentSettings(account.settings);
            }

            if (account.statblocks) {
                this.Libraries.NPCs.AddStatBlockListings(account.statblocks, "account");
            }

            if (account.playercharacters) {
                this.Libraries.PCs.AddStatBlockListings(account.playercharacters, "account");
            }
        }

        Socket = io();

        PromptQueue = new PromptQueue();
        EventLog = new EventLog();
        Libraries = new Libraries();
        StatBlockEditor = new StatBlockEditor();
        SpellEditor = new SpellEditor();
        EncounterCommander = new EncounterCommander(this);
        CombatantCommander = new CombatantCommander(this);
        AccountClient = new AccountClient();

        CombatantViewModels = ko.observableArray<CombatantViewModel>([]);
        
        private addCombatantViewModel = (combatant: Combatant) => {
            const vm = new CombatantViewModel(combatant, this.CombatantCommander, this.PromptQueue.Add, this.EventLog.AddEvent);
            this.CombatantViewModels.push(vm);
            return vm;
        }

        private removeCombatantViewModel = (vm: CombatantViewModel) => {
            this.CombatantViewModels.remove(vm);
        }

        Encounter = new Encounter(
            this.PromptQueue,
            this.Socket,
            this.addCombatantViewModel,
            this.removeCombatantViewModel
        );

        OrderedCombatants = ko.computed(() =>
            this.CombatantViewModels().sort(
                (c1, c2) => this.Encounter.Combatants.indexOf(c1.Combatant) - this.Encounter.Combatants.indexOf(c2.Combatant)
            )
        );

        TutorialVisible = ko.observable(!Store.Load(Store.User, 'SkipIntro'));
        SettingsVisible = ko.observable(false);
        LibrariesVisible = ko.observable(true);
        ToolbarWide = ko.observable(false);
        ToolbarClass = ko.pureComputed(() => this.ToolbarWide() ? "toolbar-wide" : "toolbar-narrow");

        CenterColumn = ko.pureComputed(() => {
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

        ImportEncounterIfAvailable = () => {
            const encounter = env.PostedEncounter;
            if (encounter) {
                this.TutorialVisible(false);
                this.Encounter.ImportEncounter(encounter);
            }
        }

        GetWhatsNewIfAvailable = () => {
            $.getJSON("/whatsnew/")
                .done((latestPost: PatreonPost) => {
                    this.EventLog.AddEvent(`Welcome to Improved Initiative! Here's what's new: <a href="${latestPost.attributes.url}" target="_blank">${latestPost.attributes.title}</a>`);
                });
        }

        InterfaceState = ko.pureComputed(() => {
            return [
                this.StatBlockEditor.HasStatBlock() ? 'editing-statblock' : null,
                this.CombatantCommander.HasSelected() ? 'combatant-selected' : null,
                this.LibrariesVisible() ? 'showing-libraries' : null,
                this.Encounter.State() === "active" ? 'encounter-active' : 'encounter-inactive'
            ].filter(s => s).join(' ');
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
}