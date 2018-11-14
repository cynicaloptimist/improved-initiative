import { StatBlock } from "../../common/StatBlock";
import { Dice } from "../Rules/Rules";
import { CurrentSettings } from "../Settings/Settings";

export function GetOrRollMaximumHP(statBlock: StatBlock) {
        const rollMonsterHp = CurrentSettings().Rules.RollMonsterHp;
        if (rollMonsterHp && statBlock.Player !== "player") {
            try {
                const rolledHP = Dice.RollDiceExpression(statBlock.HP.Notes).Total;
                if (rolledHP > 0) {
                    return rolledHP;
                }
                return 1;
            } catch (e) {
                console.error(e);
                return statBlock.HP.Value;
            }
        }
        return statBlock.HP.Value;
    }
