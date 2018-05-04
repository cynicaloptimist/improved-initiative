export interface PlayerViewSettings {
    AllowPlayerSuggestions: boolean;
    MonsterHPVerbosity: string;
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