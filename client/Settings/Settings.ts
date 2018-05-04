import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { Command } from "../Commands/Command";
import { CommandSetting } from "../Commands/CommandSetting";
import { Store } from "../Utility/Store";

export const CurrentSettings = ko.observable<Settings>();
export const AutoGroupInitiativeOptions = ["None", "By Name", "Side Initiative"];
export type AutoGroupInitiativeOption = "None" | "By Name" | "Side Initiative";

export interface Settings {
    Commands: CommandSetting[];
    Rules: {
        RollMonsterHp: boolean;
        AllowNegativeHP: boolean;
        AutoCheckConcentration: boolean;
        AutoGroupInitiative: AutoGroupInitiativeOption;
    };
    TrackerView: {
        DisplayRoundCounter: boolean;
        DisplayTurnTimer: boolean;
        DisplayDifficulty: boolean;
    };
    PlayerView: PlayerViewSettings;
    Version: string;
}


export const hpVerbosityOptions = [
    "Actual HP",
    "Colored Label",
    "Monochrome Label",
    "Damage Taken",
    "Hide All"
];

function getLegacySetting<T>(settingName: string, def: T): T {
    const setting = Store.Load<T>(Store.User, settingName);
    if (setting === undefined) {
        return def;
    }
    return setting;
}

function getDefaultSettings(): Settings {
    return {
        Commands: [],
        Rules: {
            RollMonsterHp: false,
            AllowNegativeHP: false,
            AutoCheckConcentration: true,
            AutoGroupInitiative: "None"
        },
        TrackerView: {
            DisplayRoundCounter: false,
            DisplayTurnTimer: false,
            DisplayDifficulty: false
        },
        PlayerView: {
            AllowPlayerSuggestions: false,
            MonsterHPVerbosity: "Colored Label",
            HideMonstersOutsideEncounter: false,
            DisplayRoundCounter: false,
            DisplayTurnTimer: false,
            DisplayPortraits: false,
            SplashPortraits: false,
            CustomCSS: "",
            CustomStyles: {
                combatantBackground: "",
                combatantText: "",
                activeCombatantIndicator: "",
                font: "",
                headerBackground: "",
                headerText: "",
                mainBackground: "",
                backgroundUrl: "",
            }
        },
        Version: process.env.VERSION
    };
}

function getLegacySettings(): Settings {
    const commandNames = Store.List(Store.KeyBindings);
    const commands: CommandSetting[] = commandNames.map(n => {
        return {
            Name: n,
            KeyBinding: Store.Load<string>(Store.KeyBindings, n),
            ShowOnActionBar: Store.Load<boolean>(Store.ActionBar, n)
        };
    });
    const defaultSettings = getDefaultSettings();

    return {
        Commands: commands,
        Rules: {
            RollMonsterHp: getLegacySetting<boolean>("RollMonsterHP", false),
            AllowNegativeHP: getLegacySetting<boolean>("AllowNegativeHP", false),
            AutoCheckConcentration: getLegacySetting<boolean>("AutoCheckConcentration", true),
            AutoGroupInitiative: getLegacySetting<AutoGroupInitiativeOption>("AutoGroupInitiative", "None")
        },
        TrackerView: {
            DisplayRoundCounter: getLegacySetting<boolean>("DisplayRoundCounter", false),
            DisplayTurnTimer: getLegacySetting<boolean>("DisplayTurnTimer", false),
            DisplayDifficulty: getLegacySetting<boolean>("DisplayDifficulty", false)
        },
        PlayerView: {
            ...defaultSettings.PlayerView,
            AllowPlayerSuggestions: getLegacySetting<boolean>("PlayerViewAllowPlayerSuggestions", false),
            MonsterHPVerbosity: getLegacySetting<string>("MonsterHPVerbosity", "Colored Label"),
            HideMonstersOutsideEncounter: getLegacySetting<boolean>("HideMonstersOutsideEncounter", false),
            DisplayRoundCounter: getLegacySetting<boolean>("PlayerViewDisplayRoundCounter", false),
            DisplayTurnTimer: getLegacySetting<boolean>("PlayerViewDisplayTurnTimer", false),
        },
        Version: defaultSettings.Version
    };
}

function configureCommands(newSettings: Settings, commands: Command[]) {
    Mousetrap.reset();

    Mousetrap.bind("backspace", e => {
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
            console.warn(`Couldn't bind command: ${b.Name}`);
            return;
        }
        Mousetrap.bind(b.KeyBinding, matchedCommands[0].ActionBinding);
        matchedCommands[0].KeyBinding = b.KeyBinding;
        matchedCommands[0].ShowOnActionBar(b.ShowOnActionBar);
    });
}

function updateToSemanticVersionIsRequired(settingsVersion: string, targetVersion: string) {
    const settingsVersionParts = settingsVersion.split(".").map(n => parseInt(n));
    const targetVersionParts = targetVersion.split(".").map(n => parseInt(n));
    if (settingsVersionParts[0] < targetVersionParts[0]) {
        return true;
    }
    if (settingsVersionParts[0] > targetVersionParts[0]) {
        return false;
    }
    if (settingsVersionParts[1] < targetVersionParts[1]) {
        return true;
    }
    if (settingsVersionParts[1] > targetVersionParts[1]) {
        return false;
    }
    if (settingsVersionParts[2] < targetVersionParts[2]) {
        return true;
    }
    if (settingsVersionParts[2] > targetVersionParts[2]) {
        return false;
    }
    return false;
}

function updateSettings(settings: any): Settings {
    const defaultSettings = getDefaultSettings();

    if (!settings.PlayerView) {
        settings.PlayerView = defaultSettings.PlayerView;
    }

    if (!settings.PlayerView.CustomStyles) {
        settings.PlayerView.CustomStyles = defaultSettings.PlayerView.CustomStyles;
    }

    if (updateToSemanticVersionIsRequired(settings.Version, "1.2.0")) {
        settings.PlayerView.CustomCSS = defaultSettings.PlayerView.CustomCSS;
    }

    if (updateToSemanticVersionIsRequired(settings.Version, "1.3.0")) {
        settings.PlayerView.CustomStyles.backgroundUrl = defaultSettings.PlayerView.CustomStyles.backgroundUrl;
    }

    return settings;
}

export function InitializeSettings() {
    const localSettings = Store.Load<any>(Store.User, "Settings");

    if (localSettings) {
        const updatedSettings = updateSettings(localSettings);
        CurrentSettings(updatedSettings);
    } else {
        const legacySettings = getLegacySettings();
        CurrentSettings(legacySettings);
    }

    Store.Save<Settings>(Store.User, "Settings", CurrentSettings());
}

export function ConfigureCommands(commands: Command[]) {
    configureCommands(CurrentSettings(), commands);
    CurrentSettings.subscribe(newSettings => configureCommands(newSettings, commands));
}
