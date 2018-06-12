import { env } from "../Environment";
import { CurrentSettings } from "../Settings/Settings";
import { Combatant } from "./Combatant";
import { Tag } from "./Tag";

export interface StaticCombatantViewModel {
    Name: string;
    HPDisplay: string;
    HPColor: string;
    Initiative: number;
    Id: string;
    Tags: Tag[];
    IsPlayerCharacter: boolean;
    ImageURL: string;
}

export function ToStaticViewModel(combatant: Combatant): StaticCombatantViewModel {
    const sendImage = env.HasEpicInitiative;
    return {
        Name: combatant.DisplayName(),
        Id: combatant.Id,
        HPDisplay: GetHPDisplay(combatant),
        HPColor: GetHPColor(combatant),
        Initiative: combatant.Initiative(),
        IsPlayerCharacter: combatant.IsPlayerCharacter,
        Tags: combatant.Tags().filter(t => t.Visible()),
        ImageURL: sendImage && combatant.StatBlock().ImageURL,
    };
}

function GetHPDisplay(combatant: Combatant): string {
    let monsterHpVerbosity = CurrentSettings().PlayerView.MonsterHPVerbosity;
    const maxHP = combatant.MaxHP(),
        currentHP = combatant.CurrentHP(),
        temporaryHP = combatant.TemporaryHP();

    if (combatant.IsPlayerCharacter || monsterHpVerbosity == "Actual HP") {
        if (temporaryHP) {
            return `${currentHP}+${temporaryHP}/${maxHP}`;
        } else {
            return `${currentHP}/${maxHP}`;
        }
    }

    if (monsterHpVerbosity == "Hide All") {
        return "";
    }

    if (monsterHpVerbosity == "Damage Taken") {
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
    const maxHP = combatant.MaxHP(), currentHP = combatant.CurrentHP();
    let monsterHpVerbosity = CurrentSettings().PlayerView.MonsterHPVerbosity;
    if (!combatant.IsPlayerCharacter &&
        (monsterHpVerbosity == "Monochrome Label" ||
            monsterHpVerbosity == "Hide All" ||
            monsterHpVerbosity == "Damage Taken")) {
        return "auto";
    }
    let green = Math.floor((currentHP / maxHP) * 170);
    let red = Math.floor((maxHP - currentHP) / maxHP * 170);
    return "rgb(" + red + "," + green + ",0)";
}