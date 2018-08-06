import { StatBlock } from "./StatBlock";

export function InitializeCharacter(statBlock: StatBlock): PersistentCharacter {
    return {
        Id: statBlock.Id,
        Version: statBlock.Version,
        Name: statBlock.Name,
        Path: statBlock.Path,
        CurrentHP: statBlock.HP.Value,
        StatBlock: statBlock,
        Notes: ""
    };
}

export const DefaultPersistentCharacter = () => InitializeCharacter(StatBlock.Default());

export interface PersistentCharacter {
    Id: string;
    Version: string;
    Name: string;
    Path: string;
    CurrentHP: number;
    StatBlock: StatBlock;
    Notes: string;
}