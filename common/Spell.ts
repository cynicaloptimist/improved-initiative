import { Listable, FilterDimensions } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface Spell extends Listable {
  Source: string;
  Level: number;
  School: string;
  CastingTime: string;
  Range: string;
  Components: string;
  Duration: string;
  Classes: string[];
  Description: string;
  Ritual: boolean;
}

export namespace Spell {
  export const GetSearchHint = (spell: Spell) =>
    [spell.Name, spell.School, ...spell.Classes].join(" ");

  export const GetFilterDimensions = (spell: Spell): FilterDimensions => ({
    Level: spell.Level.toString(),
    Type: spell.School
  });

  export const Default: () => Spell = () => {
    return {
      Id: probablyUniqueString(),
      Version: process.env.VERSION || "0.0.0",
      Name: "",
      Path: "",
      Source: "",
      CastingTime: "",
      Classes: [],
      Components: "",
      Description: "",
      Duration: "",
      Level: 0,
      Range: "",
      Ritual: false,
      School: ""
    };
  };
}
