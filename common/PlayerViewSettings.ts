export interface PlayerViewSettings {
    AllowPlayerSuggestions: boolean;
    MonsterHPVerbosity: string;
    HideMonstersOutsideEncounter: boolean;
    DisplayRoundCounter: boolean;
    DisplayTurnTimer: boolean;
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
    font: string;
}