import { StatBlock } from "./StatBlock";
import { probablyUniqueString } from "./Toolbox";

export function InitializeCharacter(statBlock: StatBlock): PersistentCharacter {
    return {
        Id: probablyUniqueString(),
        CurrentHP: statBlock.HP.Value,
        StatBlock: statBlock,
        Notes: ""
    };
}

export const DefaultPersistentCharacter = () => InitializeCharacter(StatBlock.Default());

export interface PersistentCharacter {
    Id: string;
    CurrentHP: number;
    StatBlock: StatBlock;
    Notes: string;
}