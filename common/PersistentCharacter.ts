import { now } from "moment";
import { StatBlock } from "./StatBlock";

export function InitializeCharacter(statBlock: StatBlock): PersistentCharacter {
  return {
    Id: statBlock.Id,
    Version: statBlock.Version,
    Name: statBlock.Name,
    Path: statBlock.Path,
    LastUpdateMs: now(),
    CurrentHP: statBlock.HP.Value,
    StatBlock: statBlock,
    Notes: ""
  };
}

export const DefaultPersistentCharacter = () =>
  InitializeCharacter(StatBlock.Default());

export const GetPersistentCharacterSearchHint = (
  character: PersistentCharacter
) => character.StatBlock.Type;

export const GetPersistentCharacterMetadata = (
  character: PersistentCharacter
) => ({
  Level: character.StatBlock.Challenge
});

export interface PersistentCharacter {
  Id: string;
  Version: string;
  Name: string;
  Path: string;
  LastUpdateMs: number;
  CurrentHP: number;
  StatBlock: StatBlock;
  Notes: string;
}
