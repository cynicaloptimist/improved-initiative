import { Tag } from "./Tag";
import { Combatant } from "./Combatant";
import { CurrentSettings } from "../Settings/Settings";

export class StaticCombatantViewModel {
    public Name: string;
    public HPDisplay: string;
    public HPColor: string;
    public Initiative: number;
    public Id: string;
    public Tags: Tag[];
    public IsPlayerCharacter: boolean;

    constructor(combatant: Combatant) {
        this.Name = combatant.DisplayName();
        this.Id = combatant.Id;
        this.HPDisplay = this.GetHPDisplay(combatant);
        this.HPColor = this.GetHPColor(combatant);
        this.Initiative = combatant.Initiative();
        this.IsPlayerCharacter = combatant.IsPlayerCharacter;
        this.Tags = combatant.Tags();
    }

    private GetHPDisplay(combatant: Combatant): string {
        let monsterHpVerbosity = CurrentSettings().PlayerView.MonsterHPVerbosity;

        if (combatant.IsPlayerCharacter || monsterHpVerbosity == "Actual HP") {
            if (combatant.TemporaryHP()) {
                return `${combatant.CurrentHP()}+${combatant.TemporaryHP()}/${combatant.MaxHP}`;
            } else {
                return `${combatant.CurrentHP()}/${combatant.MaxHP}`;
            }
        }

        if (monsterHpVerbosity == "Hide All") {
            return "";
        }

        if (monsterHpVerbosity == "Damage Taken") {
            return (combatant.CurrentHP() - combatant.MaxHP).toString();
        }

        if (combatant.CurrentHP() <= 0) {
            return "<span class='defeatedHP'>Defeated</span>";
        } else if (combatant.CurrentHP() < combatant.MaxHP / 2) {
            return "<span class='bloodiedHP'>Bloodied</span>";
        } else if (combatant.CurrentHP() < combatant.MaxHP) {
            return "<span class='hurtHP'>Hurt</span>";
        }
        return "<span class='healthyHP'>Healthy</span>";
    }

    private GetHPColor = (combatant: Combatant) => {
        let monsterHpVerbosity = CurrentSettings().PlayerView.MonsterHPVerbosity;
        if (!combatant.IsPlayerCharacter &&
            (monsterHpVerbosity == "Monochrome Label" ||
                monsterHpVerbosity == "Hide All" ||
                monsterHpVerbosity == "Damage Taken")) {
            return "auto";
        }
        let green = Math.floor((combatant.CurrentHP() / combatant.MaxHP) * 170);
        let red = Math.floor((combatant.MaxHP - combatant.CurrentHP()) / combatant.MaxHP * 170);
        return "rgb(" + red + "," + green + ",0)";
    }
}
