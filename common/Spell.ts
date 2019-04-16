import { Listable } from "./Listable";
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

export class Spell {
  public static GetSearchHint = (spell: Spell) =>
    [spell.Name, spell.School, ...spell.Classes].join(" ");

  public static GetMetadata = (spell: Spell) => ({
    Level: spell.Level.toString()
  });

  public static Default: () => Spell = () => {
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
