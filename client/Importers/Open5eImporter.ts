import axios from "axios";
import _ = require("lodash");
import { ListingMeta } from "../../common/Listable";
import {
  NameAndContent,
  NameAndModifier,
  StatBlock
} from "../../common/StatBlock";

export async function GetOpen5eListings() {
  const response = await axios.get("../open5e/monsters/");
  const open5eListings: ListingMeta[] = response.data;
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
        Name: _.startCase(skillName),
        Modifier: sb.skills[skillName]
      };
    }),
    Senses: commaSeparatedStrings(sb.senses),
    Languages: commaSeparatedStrings(sb.languages),
    Challenge: sb.challenge_rating,
    Traits: nameAndDescArrays(sb.special_abilities),
    Actions: nameAndDescArrays(sb.actions),
    LegendaryActions: nameAndDescArrays(sb.legendary_actions),
    Reactions: nameAndDescArrays(sb.reactions)
  };
}

function parenthetizeOrEmpty(input: string | undefined) {
  if (!input) {
    return "";
  }
  return `(${input})`;
}

function commaSeparatedStrings(input: string | undefined) {
  if (!input || input.length === 0 || !input.split) {
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

function nameAndDescArrays(entries: any): NameAndContent[] {
  if (!entries.content?.map) {
    return [];
  }
  return entries.content.map(getNameAndContent);
}

function getNameAndContent(data: {
  name: string;
  desc: string;
}): NameAndContent {
  return {
    Name: data.name,
    Content: data.desc
  };
}
