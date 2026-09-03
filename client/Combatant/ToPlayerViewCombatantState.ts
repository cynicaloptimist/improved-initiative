import {
  PlayerViewCombatantState,
  PlayerViewHealthState
} from "../../common/PlayerViewCombatantState";
import { HpVerbosityOption } from "../../common/PlayerViewSettings";
import { env } from "../Environment";
import { CurrentSettings } from "../Settings/Settings";
import { Combatant } from "./Combatant";

export function ToPlayerViewCombatantState(
  combatant: Combatant
): PlayerViewCombatantState {
  const sendImage = env.HasEpicInitiative;
  return {
    Name: combatant.DisplayName(),
    Id: combatant.Id,
    HPDisplay: GetHPDisplay(combatant),
    HPColor: GetHPColor(combatant),
    HealthState: GetDisplayedHealthState(combatant),
    Initiative: combatant.Initiative(),
    IsPlayerCharacter: combatant.IsPlayerCharacter(),
    Tags: combatant
      .Tags()
      .filter(t => t.NotExpired() && !t.HiddenFromPlayerView)
      .map(t => {
        return {
          Text: t.Text,
          DurationRemaining: t.DurationRemaining(),
          DurationTiming: t.DurationTiming,
          DurationCombatantId: t.DurationCombatantId
        };
      }),
    ImageURL: sendImage ? combatant.StatBlock().ImageURL : "",
    AC: combatant.RevealedAC() ? combatant.StatBlock().AC.Value : undefined,
    Color: combatant.Color(),
    ReactionsSpent: combatant.ReactionsSpent()
  };
}

function GetHPDisplay(combatant: Combatant): string {
  const hpVerbosity = GetHPVerbosity(combatant);
  const maxHP = combatant.MaxHP(),
    currentHP = combatant.CurrentHP(),
    temporaryHP = combatant.TemporaryHP();
  if (hpVerbosity == HpVerbosityOption.ActualHP) {
    if (temporaryHP) {
      return `${currentHP}+${temporaryHP}/${maxHP}`;
    } else {
      return `${currentHP}/${maxHP}`;
    }
  }
  if (hpVerbosity == HpVerbosityOption.HideAll) {
    return "";
  }
  if (hpVerbosity == HpVerbosityOption.DamageTaken) {
    return (currentHP - maxHP).toString();
  }
  if (currentHP <= 0) {
    return "<span class='defeatedHP'>Defeated</span>";
  } else if (currentHP < maxHP / 2) {
    return "<span class='bloodiedHP'>Bloodied</span>";
  } else if (currentHP < maxHP) {
    return "<span class='hurtHP'>Hurt</span>";
  }
  return "<span class='healthyHP'>Healthy</span>";
}

function GetHPColor(combatant: Combatant) {
  const maxHP = combatant.MaxHP(),
    currentHP = combatant.CurrentHP();
  const hpVerbosity = GetHPVerbosity(combatant);
  if (
    hpVerbosity == HpVerbosityOption.MonochromeLabel ||
    hpVerbosity == HpVerbosityOption.HideAll ||
    hpVerbosity == HpVerbosityOption.DamageTaken
  ) {
    return "auto";
  }
  const green = Math.floor((currentHP / maxHP) * 170);
  const red = Math.floor(((maxHP - currentHP) / maxHP) * 170);
  return "rgb(" + red + "," + green + ",0)";
}

function GetDisplayedHealthState(
  combatant: Combatant
): PlayerViewHealthState | undefined {
  const hpVerbosity = GetHPVerbosity(combatant);
  if (
    hpVerbosity == HpVerbosityOption.HideAll ||
    hpVerbosity == HpVerbosityOption.DamageTaken
  ) {
    return undefined;
  }

  const currentHP = combatant.CurrentHP();
  const maxHP = combatant.MaxHP();
  if (currentHP <= 0) {
    return "defeated";
  }
  if (currentHP < maxHP / 2) {
    return "bloodied";
  }
  if (currentHP < maxHP) {
    return "hurt";
  }
  return "healthy";
}

function GetHPVerbosity(combatant: Combatant): HpVerbosityOption {
  return combatant.IsPlayerCharacter()
    ? CurrentSettings().PlayerView.PlayerHPVerbosity
    : CurrentSettings().PlayerView.MonsterHPVerbosity;
}
