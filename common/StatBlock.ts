import { Listable, ListingMetadata } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface AbilityScores {
  Str: number;
  Dex: number;
  Con: number;
  Cha: number;
  Int: number;
  Wis: number;
}

export interface NameAndModifier {
  Name: string;
  Modifier: number;
}

export interface ValueAndNotes {
  Value: number;
  Notes: string;
}

export interface NameAndContent {
  Name: string;
  Content: string;
  Usage?: string;
}

export interface StatBlock extends Listable {
  Source: string;
  Type: string;
  HP: ValueAndNotes;
  AC: ValueAndNotes;
  Speed: string[];
  Abilities: AbilityScores;
  InitiativeModifier?: number;
  InitiativeSpecialRoll?: "advantage" | "disadvantage" | "take-ten";
  InitiativeAdvantage?: boolean;
  DamageVulnerabilities: string[];
  DamageResistances: string[];
  DamageImmunities: string[];
  ConditionImmunities: string[];
  Saves: NameAndModifier[];
  Skills: NameAndModifier[];
  Senses: string[];
  Languages: string[];
  Challenge: string;
  Traits: NameAndContent[];
  Actions: NameAndContent[];
  Reactions: NameAndContent[];
  LegendaryActions: NameAndContent[];
  Description: string;
  Player: string;
  ImageURL: string;
}

export class StatBlock {
  public static GetKeywords = (statBlock: StatBlock) =>
    statBlock.Type.toLocaleLowerCase().replace(/[^\w\s]/g, "");

  public static GetMetadata = (statBlock: StatBlock): ListingMetadata => {
    return {
      Level: statBlock.Challenge,
      Source: statBlock.Source,
      Type: statBlock.Type
    };
  };

  public static Default = (): StatBlock => ({
    Id: probablyUniqueString(),
    Name: "",
    Path: "",
    Source: "",
    Type: "",
    HP: { Value: 1, Notes: "(1d1+0)" },
    AC: { Value: 10, Notes: "" },
    InitiativeModifier: 0,
    InitiativeAdvantage: false,
    Speed: [],
    Abilities: { Str: 10, Dex: 10, Con: 10, Int: 10, Wis: 10, Cha: 10 },
    DamageVulnerabilities: [],
    DamageResistances: [],
    DamageImmunities: [],
    ConditionImmunities: [],
    Saves: [],
    Skills: [],
    Senses: [],
    Languages: [],
    Challenge: "",
    Traits: [],
    Actions: [],
    Reactions: [],
    LegendaryActions: [],
    Description: "",
    Player: "",
    Version: process.env.VERSION || "0.0.0",
    ImageURL: ""
  });

  public static readonly AbilityNames = [
    "Str",
    "Dex",
    "Con",
    "Int",
    "Wis",
    "Cha"
  ];
}
