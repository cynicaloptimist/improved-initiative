import { now } from "moment";
import { StatBlock } from "./StatBlock";
import { probablyUniqueString } from "./Toolbox";

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

export namespace PersistentCharacter {
  export function Initialize(statBlock: StatBlock): PersistentCharacter {
    return {
      Id: statBlock.Id || probablyUniqueString(),
      Version: statBlock.Version,
      Name: statBlock.Name,
      Path: statBlock.Path,
      LastUpdateMs: now(),
      CurrentHP: statBlock.HP.Value,
      StatBlock: statBlock,
      Notes: ""
    };
  }

  export const Default = () => Initialize(StatBlock.Default());

  export const GetSearchHint = (character: PersistentCharacter) =>
    character.StatBlock.Type;

  const GetTotalLevelFromString = (levelString: string) => {
    const matches = levelString.toString().match(/\d+/g);
    if (!matches) {
      return "";
    }

    return matches
      .reduce((total, digitMatch) => {
        const level = parseInt(digitMatch);
        if (!isNaN(level)) {
          return total + level;
        }
        return total;
      }, 0)
      .toString();
  };

  export const GetMetadata = (character: PersistentCharacter) => ({
    Level: GetTotalLevelFromString(character.StatBlock.Challenge)
  });
}
