import { CommandSetting } from "./CommandSetting";
import { HpVerbosityOption, PlayerViewSettings } from "./PlayerViewSettings";

export enum AutoGroupInitiativeOption {
  None = "None",
  ByName = "By Name",
  SideInitiative = "Side Initiative"
}

export enum AutoRerollInitiativeOption {
  No = "No",
  Prompt = "Prompt",
  Automatic = "Automatic"
}

export enum PostCombatStatsOption {
  None = "None",
  EncounterViewOnly = "Encounter view only",
  PlayerViewOnly = "Player view only",
  Both = "Both"
}

export interface Settings {
  Commands: CommandSetting[];
  Rules: {
    RollMonsterHp: boolean;
    EnableBossAndMinionHP: boolean;
    AllowNegativeHP: boolean;
    AutoCheckConcentration: boolean;
    AutoGroupInitiative: AutoGroupInitiativeOption;
    AutoRerollInitiative: AutoRerollInitiativeOption;
  };
  TrackerView: {
    DisplayPortraits: boolean;
    DisplayRoundCounter: boolean;
    DisplayTurnTimer: boolean;
    DisplayDifficulty: boolean;
    DisplayHPBar: boolean;
    DisplayCombatantColor: boolean;
    DisplayReactionTracker: boolean;
    PostCombatStats: PostCombatStatsOption;
  };
  PlayerView: PlayerViewSettings;
  PreloadedStatBlockSources: Record<string, boolean | undefined>;
  RecentItemIds: string[];
  Version: string;
}

export function getDefaultSettings(): Settings {
  return {
    Commands: [],
    Rules: {
      RollMonsterHp: false,
      EnableBossAndMinionHP: false,
      AllowNegativeHP: false,
      AutoCheckConcentration: true,
      AutoGroupInitiative: AutoGroupInitiativeOption.None,
      AutoRerollInitiative: AutoRerollInitiativeOption.No
    },
    TrackerView: {
      DisplayPortraits: false,
      DisplayRoundCounter: false,
      DisplayTurnTimer: false,
      DisplayDifficulty: true,
      DisplayHPBar: false,
      DisplayCombatantColor: false,
      DisplayReactionTracker: false,
      PostCombatStats: PostCombatStatsOption.None
    },
    PlayerView: {
      ActiveCombatantOnTop: false,
      AllowPlayerSuggestions: false,
      AllowTagSuggestions: false,
      MonsterHPVerbosity: HpVerbosityOption.ColoredLabel,
      PlayerHPVerbosity: HpVerbosityOption.ActualHP,
      HideMonstersOutsideEncounter: false,
      DisplayRoundCounter: false,
      DisplayTurnTimer: false,
      DisplayPortraits: false,
      DisplayCombatantColor: false,
      DisplayReactionTracker: false,
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
        backgroundUrl: ""
      },
      CustomEncounterId: ""
    },
    PreloadedStatBlockSources: {
      "wotc-srd": true
    },
    RecentItemIds: [],
    Version: process.env.VERSION || "0.0.0"
  };
}
