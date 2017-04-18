module ImprovedInitiative {
    interface PatreonPost {
        title: string;
        content: string;
        url: string;
        created_at: string;
    }

    export var Settings = (params: {
        encounterCommander: EncounterCommander;
        combatantCommander: CombatantCommander;
        settingsVisible: KnockoutObservable<boolean>;
        repeatTutorial: () => void;
    }) => {
        var tips = [
            "You can view command list and set keybindings on the 'Commands' tab.",
            "Encounters built in <a href='http://kobold.club' target='_blank'>Kobold Fight Club</a> can be imported into Improved Initiative.",
            "Improved Initiative is in a beta state. Please periodically export your user data for safe keeping!",
            "You can use the player view URL to track your combat on any device.",
            "Editing a creature after it has been added to combat will only change that individual creature.",
            "You can restore a creature's hit points by applying negative damage to it.",
            "Temporary hit points obey the 5th edition rules- applying temporary hitpoints will ignore temporary hit points a creature already has.",
            "Clicking a creature holding 'alt' will hide it from the player view when adding it to combat.",
            "Hold the control key while clicking to select multiple combatants. You can apply damage to multiple creatures at the same time this way.",
            "Moving a creature in the initiative order will automatically adjust their initiative count.",
            "The active creature will have its traits and actions displayed first for ease of reference.",
            "The player view will only display a colored, qualitative indicator for Monster HP. You can change this in the settings tab.",
            "You can create tags that disappear after a set amount of rounds in order to automatically remove conditions at the end of a combatant's turn.",
            "Want to contribute? Improved Initiative is written in TypeScript and runs on node.js. Fork it at <a href='http://github.com/cynicaloptimist/improved-initiative' target='_blank'>Github.</a>"
        ];

        const whatsNew = ko.observable("");
        $.getJSON("/whatsnew/")
            .done((latestPost: PatreonPost) => {
                whatsNew(`<a href="${latestPost.url}" target="_blank">${latestPost.title}</a>`);
            });

        const registerKeybindings = () => {
            const allCommands = [...params.encounterCommander.Commands, ...params.combatantCommander.Commands];
            Mousetrap.reset();

            Mousetrap.bind('backspace', e => {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    // internet explorer
                    e.returnValue = false;
                }
            })

            allCommands.forEach(b => {
                Mousetrap.bind(b.KeyBinding, b.ActionBinding);
                Store.Save<string>(Store.KeyBindings, b.Description, b.KeyBinding);
                Store.Save<boolean>(Store.ActionBar, b.Description, b.ShowOnActionBar());
            });
        }

        registerKeybindings();

        const saveAndClose = () => {
            registerKeybindings();
            params.settingsVisible(false);
        }

        const currentTipIndex = ko.observable(Math.floor(Math.random() * tips.length));

        function cycleTipIndex() {
            var newIndex = currentTipIndex() + this;
            if (newIndex < 0) {
                newIndex = tips.length - 1;
            } else if (newIndex > tips.length - 1) {
                newIndex = 0;
            }
            currentTipIndex(newIndex);
        }

        var loadSetting = (settingName: string, defaultSetting?) => {
            var setting = ko.observable(Store.Load(Store.User, settingName) || defaultSetting);
            setting.subscribe(newValue => {
                Store.Save(Store.User, settingName, newValue);
            });
            return setting;
        }

        var displayRoundCounter = loadSetting("DisplayRoundCounter");
        displayRoundCounter.subscribe(params.encounterCommander.DisplayRoundCounter);

        var displayTurnTimer = loadSetting("DisplayTurnTimer");
        displayTurnTimer.subscribe(params.encounterCommander.DisplayTurnTimer);

        var displayDifficulty = loadSetting("DisplayDifficulty");
        displayDifficulty.subscribe(params.encounterCommander.DisplayDifficulty);

        return {
            EncounterCommands: params.encounterCommander.Commands,
            CombatantCommands: params.combatantCommander.Commands,

            CurrentTab: ko.observable<string>('about'),
            ExportData: () => {
                var blob = Store.ExportAll();
                saveAs(blob, 'improved-initiative.json');
            },
            ImportData: (_, event) => {
                var file = event.target.files[0];
                if (file) {
                    Store.ImportAll(file);
                }
            },

            ImportDndAppFile: (_, event) => {
                var file = event.target.files[0];
                if (file) {
                    Store.ImportFromDnDAppFile(file);
                }
            },

            RepeatTutorial: params.repeatTutorial,

            RollHp: loadSetting("RollMonsterHp"),
            HpVerbosityOptions: [
                "Actual HP",
                "Colored Label",
                "Monochrome Label",
                "Hide All"
            ],
            HpVerbosity: loadSetting("MonsterHPVerbosity", "Colored Label"),
            HideMonstersOutsideEncounter: loadSetting("HideMonstersOutsideEncounter"),
            AllowNegativeHP: loadSetting("AllowNegativeHP"),
            DisplayRoundCounter: displayRoundCounter,
            DisplayTurnTimer: displayTurnTimer,
            DisplayDifficulty: displayDifficulty,
            PlayerViewDisplayRoundCounter: loadSetting("PlayerViewDisplayRoundCounter", false),
            PlayerViewDisplayTurnTimer: loadSetting("PlayerViewDisplayTurnTimer", false),
            Tip: ko.pureComputed(() => tips[currentTipIndex() % tips.length]),
            WhatsNew: whatsNew,
            NextTip: cycleTipIndex.bind(1),
            PreviousTip: cycleTipIndex.bind(-1),
            SaveAndClose: saveAndClose
        }
    }
}