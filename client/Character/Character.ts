import { StatBlock } from "../../common/StatBlock";

export function InitializeCharacter(statBlock: StatBlock): Character {
    return {
        CurrentHP: statBlock.HP.Value,
        StatBlock: statBlock
    };
}

export interface Character {
    CurrentHP: number;
    StatBlock: StatBlock;
}