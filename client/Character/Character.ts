import { StatBlock } from "../../common/StatBlock";

export function InitializeCharacter(statBlock: StatBlock): Character {
    return {
        CurrentHP: statBlock.HP.Value,
        StatBlock: statBlock,
        Notes: ""
    };
}

export interface Character {
    CurrentHP: number;
    StatBlock: StatBlock;
    Notes: string;
}