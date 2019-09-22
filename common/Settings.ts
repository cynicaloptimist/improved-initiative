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

export interface Settings {
  Commands: CommandSetting[];
  Rules: {
    RollMonsterHp: boolean;
    AllowNegativeHP: boolean;
    AutoCheckConcentration: boolean;
    AutoGroupInitiative: AutoGroupInitiativeOption;
    AutoRerollInitiative: AutoRerollInitiativeOption;
  };
  TrackerView: {
    DisplayRoundCounter: boolean;
    DisplayTurnTimer: boolean;
    DisplayDifficulty: boolean;
    PostCombatStats: boolean;
  };
  PlayerView: PlayerViewSettings;
  Version: string;
}

export function getDefaultSettings(): Settings {
  return {
    Commands: [],
    Rules: {
      RollMonsterHp: false,
      AllowNegativeHP: false,
      AutoCheckConcentration: true,
      AutoGroupInitiative: AutoGroupInitiativeOption.None,
      AutoRerollInitiative: AutoRerollInitiativeOption.No
    },
    TrackerView: {
      DisplayRoundCounter: false,
      DisplayTurnTimer: false,
      DisplayDifficulty: true,
      PostCombatStats: false
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
      }
    },
    Version: process.env.VERSION || "0.0.0"
  };
}
