import axios from "axios";
import { Db } from "mongodb";
import { ListingMeta } from "../../common/Listable";
import {
  NameAndContent,
  NameAndModifier,
  StatBlock
} from "../../common/StatBlock";

export async function GetOpen5eListings() {
  const open5eResponse = await axios.get(
    "https://api.open5e.com/monsters/?limit=1500&fields=name,slug,size,type,subtype,alignment,challenge_rating,document__title"
  );

  const open5eListings: ListingMeta[] = open5eResponse.data.results.map(r => {
    const listingMeta: ListingMeta = {
      Id: "open5e-" + r.slug,
      Name: r.name,
      Path: "",
      Link: `https://api.open5e.com/monsters/${r.slug}`,
      LastUpdateMs: 0,
      SearchHint: `${r.name}
                   ${r.type}
                   ${r.subtype}
                   ${r.alignment}`
        .toLocaleLowerCase()
        .replace(/[^\w\s]/g, ""),
      FilterDimensions: {
        Level: r.challenge_rating,
        Source: r.document__title,
        Type: `${r.type} (${r.subtype})`
      }
    };
    return listingMeta;
  });
  return open5eListings;
}

export function ImportOpen5eStatBlock(open5eStatBlock: any): StatBlock {
  const sb = open5eStatBlock;
  return {
    ...StatBlock.Default(),
    Name: sb.name,
    Source: sb.document__title,
    Type: sb.type + " " + parenthetizeOrEmpty(sb.subtype),
    HP: {
      Value: sb.hit_points,
      Notes: parenthetizeOrEmpty(sb.hit_dice)
    },
    AC: {
      Value: sb.armor_class,
      Notes: parenthetizeOrEmpty(sb.armor_desc)
    },
    InitiativeModifier: 0,
    Speed: Object.keys(sb.speed).map(speedType => {
      return `${speedType} ${sb.speed[speedType]} ft.`;
    }),
    Abilities: {
      Str: sb.strength,
      Dex: sb.dexterity,
      Con: sb.constitution,
      Int: sb.intelligence,
      Wis: sb.wisdom,
      Cha: sb.charisma
    },
    DamageVulnerabilities: commaSeparatedStrings(sb.damage_vulnerabilities),
    DamageResistances: commaSeparatedStrings(sb.damage_resistances),
    DamageImmunities: commaSeparatedStrings(sb.damage_immunities),
    ConditionImmunities: commaSeparatedStrings(sb.condition_immunities),
    Saves: getSaves(sb),
    Skills: Object.keys(sb.skills).map(skillName => {
      return {
        Name: skillName,
        Modifier: sb.skills[skillName]
      };
    }),
    Senses: commaSeparatedStrings(sb.senses),
    Languages: commaSeparatedStrings(sb.languages),
    Challenge: sb.challenge_rating,
    Traits: sb.special_abilities.map(mapToNameAndContent),
    Actions: sb.actions.map(mapToNameAndContent),
    LegendaryActions: sb.legendary_actions.map(mapToNameAndContent),
    Reactions: sb.reactions.map?.(mapToNameAndContent) || []
  };
}

function parenthetizeOrEmpty(input: string | undefined) {
  if (!input) {
    return "";
  }
  return `(${input})`;
}

function commaSeparatedStrings(input: string) {
  if (input.length === 0) {
    return [];
  }
  return input.split(", ");
}

function getSaves(sb: any): NameAndModifier[] {
  const saves: NameAndModifier[] = [];
  if (sb.strength_save !== null) {
    saves.push({
      Name: "Str",
      Modifier: sb.strength_save
    });
  }

  if (sb.dexterity_save !== null) {
    saves.push({
      Name: "Dex",
      Modifier: sb.dexterity_save
    });
  }

  if (sb.constitution_save !== null) {
    saves.push({
      Name: "Con",
      Modifier: sb.constitution_save
    });
  }

  if (sb.intelligence_save !== null) {
    saves.push({
      Name: "Int",
      Modifier: sb.intelligence_save
    });
  }

  if (sb.wisdom_save !== null) {
    saves.push({
      Name: "Wis",
      Modifier: sb.wisdom_save
    });
  }

  if (sb.charisma_save !== null) {
    saves.push({
      Name: "Cha",
      Modifier: sb.charisma_save
    });
  }

  return saves;
}

function mapToNameAndContent(data: {
  name: string;
  desc: string;
}): NameAndContent {
  return {
    Name: data.name,
    Content: data.desc
  };
}
