export type HpVerbosityOption =
    "Actual HP" |
    "Colored Label" |
    "Monochrome Label" |
    "Damage Taken" |
    "Hide All";

export const HpVerbosityOptions: HpVerbosityOption [] = [
    "Actual HP",
    "Colored Label",
    "Monochrome Label",
    "Damage Taken",
    "Hide All"
];

export interface PlayerViewSettings {
    AllowPlayerSuggestions: boolean;
    MonsterHPVerbosity: HpVerbosityOption;
    PlayerHPVerbosity: HpVerbosityOption;
    HideMonstersOutsideEncounter: boolean;
    DisplayRoundCounter: boolean;
    DisplayTurnTimer: boolean;
    DisplayPortraits: boolean;
    SplashPortraits: boolean;
    CustomCSS: string;
    CustomStyles: PlayerViewCustomStyles;
}

export interface PlayerViewCustomStyles {
    mainBackground: string;
    combatantBackground: string;
    combatantText: string;
    activeCombatantIndicator: string;
    headerBackground: string;
    headerText: string;
    backgroundUrl: string;
    font: string;
}