module ImprovedInitiative {
    export const CurrentSettings = ko.observable<Settings>();
    export interface Settings {
        Commands: CommandSetting[];
        Rules: {
            RollMonsterHp: boolean;
            AllowNegativeHP: boolean;
            AutoCheckConcentration: boolean;
        }
        TrackerView: {
            DisplayRoundCounter: boolean;
            DisplayTurnTimer: boolean;
            DisplayDifficulty: boolean;
        }
        PlayerView: {
            AllowPlayerSuggestions: boolean;
            MonsterHPVerbosity: string;
            HideMonstersOutsideEncounter: boolean;
            DisplayRoundCounter: boolean;
            DisplayTurnTimer: boolean;
        }
        Version: string;
    }

    export const hpVerbosityOptions = [
        "Actual HP",
        "Colored Label",
        "Monochrome Label",
        "Damage Taken",
        "Hide All"
    ];

    function getSetting<T>(settingName: string, def: T): T {
        const setting = Store.Load<T>(Store.User, settingName);
        if (setting === undefined) {
            return def;
        }
        return setting;
    }

    function getLegacySettings(): Settings {
        const commandNames = Store.List(Store.KeyBindings);
        const commands: CommandSetting[] = commandNames.map(n => {
            return {
                Name: n,
                KeyBinding: Store.Load<string>(Store.KeyBindings, n),
                ShowOnActionBar: Store.Load<boolean>(Store.ActionBar, n)
            }
        });

        return {
            Commands: commands,
            Rules: {
                RollMonsterHp: getSetting<boolean>("RollMonsterHP", false),
                AllowNegativeHP: getSetting<boolean>("AllowNegativeHP", false),
                AutoCheckConcentration: getSetting<boolean>("AutoCheckConcentration", true)
            },
            TrackerView: {
                DisplayRoundCounter: getSetting<boolean>("DisplayRoundCounter", false),
                DisplayTurnTimer: getSetting<boolean>("DisplayTurnTimer", false),
                DisplayDifficulty: getSetting<boolean>("DisplayDifficulty", false)
            },
            PlayerView: {
                AllowPlayerSuggestions: getSetting<boolean>("PlayerViewAllowPlayerSuggestions", false),
                MonsterHPVerbosity: getSetting<string>("MonsterHPVerbosity", "Colored Label"),
                HideMonstersOutsideEncounter: getSetting<boolean>("HideMonstersOutsideEncounter", false),
                DisplayRoundCounter: getSetting<boolean>("PlayerViewDisplayRoundCounter", false),
                DisplayTurnTimer: getSetting<boolean>("PlayerViewDisplayTurnTimer", false)
            },
            Version: "1.0.0" //TODO: Populate with package version
        }
    }

    function configureCommands(newSettings: Settings, commands: Command []) {
        Mousetrap.reset();

        Mousetrap.bind('backspace', e => {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                // internet explorer
                e.returnValue = false;
            }
        });

        newSettings.Commands.forEach(b => {
            const matchedCommands = commands.filter(c => c.Description == b.Name);
            if (matchedCommands.length !== 1) {
                throw `Couldn't bind command: ${b.Name}`;
            }
            Mousetrap.bind(b.KeyBinding, matchedCommands[0].ActionBinding);
            matchedCommands[0].ShowOnActionBar(b.ShowOnActionBar);
        });
    }

    export function InitializeSettings() {
        const localSettings = Store.Load<Settings>(Store.User, "Settings");

        if (localSettings) {
            CurrentSettings(localSettings);
        } else {
            const legacySettings = getLegacySettings();
            CurrentSettings(legacySettings)
        }

        if (env.HasStorage) {
            $.getJSON('/my/settings', (data, status) => {
                CurrentSettings(data);
            });
        }
    }

    export function ConfigureCommands(commands: Command[]) {
        configureCommands(CurrentSettings(), commands);
        CurrentSettings.subscribe(newSettings => configureCommands(newSettings, commands));
    }
}