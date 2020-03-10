import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
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
    AC: combatant.RevealedAC() ? combatant.StatBlock().AC.Value : undefined
  };
}

function GetHPDisplay(combatant: Combatant): string {
  const hpVerbosity = combatant.IsPlayerCharacter()
    ? CurrentSettings().PlayerView.PlayerHPVerbosity
    : CurrentSettings().PlayerView.MonsterHPVerbosity;
  const maxHP = combatant.MaxHP(),
    currentHP = combatant.CurrentHP(),
    temporaryHP = combatant.TemporaryHP();
  if (hpVerbosity == "Actual HP") {
    if (temporaryHP) {
      return `${currentHP}+${temporaryHP}/${maxHP}`;
    } else {
      return `${currentHP}/${maxHP}`;
    }
  }
  if (hpVerbosity == "Hide All") {
    return "";
  }
  if (hpVerbosity == "Damage Taken") {
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
  const hpVerbosity = combatant.IsPlayerCharacter()
    ? CurrentSettings().PlayerView.PlayerHPVerbosity
    : CurrentSettings().PlayerView.MonsterHPVerbosity;
  if (
    hpVerbosity == "Monochrome Label" ||
    hpVerbosity == "Hide All" ||
    hpVerbosity == "Damage Taken"
  ) {
    return "auto";
  }
  const green = Math.floor((currentHP / maxHP) * 170);
  const red = Math.floor(((maxHP - currentHP) / maxHP) * 170);
  return "rgb(" + red + "," + green + ",0)";
}
