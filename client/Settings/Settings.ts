module ImprovedInitiative {
    export interface Settings {
        Rules: {
            RollMonsterHp: boolean;
            AllowNegativeHP: boolean;
            AutoCheckConcentration: boolean;
        };
        TrackerView: {
            DisplayRoundCounter: boolean;
            DisplayTurnTimer: boolean;
            DisplayDifficulty: boolean;
        };
        PlayerView: {
            AllowPlayerSuggestions: boolean;
            MonsterHPVerbosity: string;
            HideMonstersOutsideEncounter: boolean;
            DisplayRoundCounter: boolean;
            DisplayTurnTimer: boolean;
        }
        Version: string;
    }
}