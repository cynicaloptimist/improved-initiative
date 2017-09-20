module ImprovedInitiative {
    const tips = [
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

    const hpVerbosityOptions = [
        "Actual HP",
        "Colored Label",
        "Monochrome Label",
        "Hide All"
    ];

    const loadSetting = (settingName: string, defaultSetting?) => {
        var currentSetting = Store.Load(Store.User, settingName);

        if (defaultSetting !== undefined && currentSetting === null) {
            Store.Save(Store.User, settingName, defaultSetting);
        }

        var setting = ko.observable(currentSetting || defaultSetting);
        setting.subscribe(newValue => {
            Store.Save(Store.User, settingName, newValue);
        });
        return setting;
    }

    const registerKeybindings = (encounterCommander: EncounterCommander, combatantCommander: CombatantCommander) => {
        const allCommands = [...encounterCommander.Commands, ...combatantCommander.Commands];
        Mousetrap.reset();

        Mousetrap.bind('backspace', e => {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                // internet explorer
                e.returnValue = false;
            }
        });

        allCommands.forEach(b => {
            Mousetrap.bind(b.KeyBinding, b.ActionBinding);
            Store.Save<string>(Store.KeyBindings, b.Description, b.KeyBinding);
            Store.Save<boolean>(Store.ActionBar, b.Description, b.ShowOnActionBar());
        });
    }

    export class SettingsViewModel {
        SaveAndClose: () => void;

        PreviousTip: any;
        NextTip: any;
        Tip: KnockoutComputed<string>;

        PlayerViewAllowPlayerSuggestions: KnockoutObservable<boolean>;
        PlayerViewDisplayTurnTimer: KnockoutObservable<boolean>;
        PlayerViewDisplayRoundCounter: KnockoutObservable<boolean>;
        DisplayDifficulty: KnockoutObservable<boolean>;
        DisplayTurnTimer: KnockoutObservable<boolean>;
        DisplayRoundCounter: KnockoutObservable<boolean>;
        AutoCheckConcentration: KnockoutObservable<boolean>;
        AllowNegativeHP: KnockoutObservable<boolean>;
        HideMonstersOutsideEncounter: KnockoutObservable<boolean>;
        HpVerbosityOptions: string[];
        HpVerbosity: KnockoutObservable<string>;
        EncounterCommands: Command[];
        CombatantCommands: Command[];
        CurrentTab = ko.observable<string>('about');
        RollHp: KnockoutObservable<boolean>;

        ExportData = () => {
            var blob = Store.ExportAll();
            saveAs(blob, 'improved-initiative.json');
        }

        ImportData = (_, event) => {
            var file = event.target.files[0];
            if (file) {
                Store.ImportAll(file);
            }
        }

        ImportDndAppFile = (_, event) => {
            var file = event.target.files[0];
            if (file) {
                Store.ImportFromDnDAppFile(file);
            }
        }

        RepeatTutorial: () => void;

        constructor(encounterCommander: EncounterCommander,
            combatantCommander: CombatantCommander,
            settingsVisible: KnockoutObservable<boolean>,
            repeatTutorial: () => void,
        ) {
            registerKeybindings(encounterCommander, combatantCommander);

            const saveAndClose = () => {
                registerKeybindings(encounterCommander, combatantCommander);
                settingsVisible(false);
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

            this.EncounterCommands = encounterCommander.Commands;
            this.CombatantCommands = combatantCommander.Commands;

            this.RepeatTutorial = repeatTutorial;

            this.RollHp = loadSetting("RollMonsterHP");
            this.HpVerbosity = loadSetting("MonsterHPVerbosity", "Colored Label");
            this.HpVerbosityOptions = hpVerbosityOptions;

            this.HideMonstersOutsideEncounter = loadSetting("HideMonstersOutsideEncounter");
            this.AllowNegativeHP = loadSetting("AllowNegativeHP");
            this.AutoCheckConcentration = loadSetting("AutoCheckConcentration", true);

            this.DisplayRoundCounter = loadSetting("DisplayRoundCounter");
            this.DisplayRoundCounter.subscribe(encounterCommander.DisplayRoundCounter);

            this.DisplayTurnTimer = loadSetting("DisplayTurnTimer");
            this.DisplayTurnTimer.subscribe(encounterCommander.DisplayTurnTimer);
            
            this.DisplayDifficulty = loadSetting("DisplayDifficulty");
            this.DisplayDifficulty.subscribe(encounterCommander.DisplayDifficulty)

            this.PlayerViewDisplayRoundCounter = loadSetting("PlayerViewDisplayRoundCounter", false);
            this.PlayerViewDisplayTurnTimer = loadSetting("PlayerViewDisplayTurnTimer", false);
            this.PlayerViewAllowPlayerSuggestions = loadSetting("PlayerViewAllowPlayerSuggestions", false);

            this.Tip = ko.pureComputed(() => tips[currentTipIndex() % tips.length]);
            this.NextTip = cycleTipIndex.bind(1);
            this.PreviousTip = cycleTipIndex.bind(-1);

            this.SaveAndClose = saveAndClose;
        }
    }
}