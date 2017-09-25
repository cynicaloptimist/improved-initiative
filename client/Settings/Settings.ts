module ImprovedInitiative {
    export interface Settings {
        EncounterCommands: CommandSetting[];
        CombatantCommands: CommandSetting[];
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

    export function GetDefaultSettings(): Settings {
        return {
            EncounterCommands: [],
            CombatantCommands: [],
            Rules: {
                RollMonsterHp: false,
                AllowNegativeHP: false,
                AutoCheckConcentration: true
            },
            TrackerView: {
                DisplayRoundCounter: false,
                DisplayTurnTimer: false,
                DisplayDifficulty: false,
            },
            PlayerView: {
                AllowPlayerSuggestions: false,
                MonsterHPVerbosity: "Colored Label",
                HideMonstersOutsideEncounter: false,
                DisplayRoundCounter: false,
                DisplayTurnTimer: false
            },
            Version: "1.0.0" //TODO: Populate with package version
        }
    }
}