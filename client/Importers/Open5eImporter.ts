import * as _ from "lodash";

import {
  NameAndContent,
  NameAndModifier,
  StatBlock
} from "../../common/StatBlock";
import { normalizeChallengeRating } from "../../common/Toolbox";
import { Spell } from "../../common/Spell";

export function ImportOpen5eStatBlock(
  open5eStatBlock: Record<string, any>
): StatBlock {
  const sb = open5eStatBlock;
  return {
    ...StatBlock.Default(),
    Name: sb.name,
    Source: sb.document__title,
    Type: getType(sb) + " " + parenthesizeOrEmpty(sb.subtype),
    HP: {
      Value: sb.hit_points,
      Notes: parenthesizeOrEmpty(sb.hit_dice)
    },
    AC: {
      Value: sb.armor_class,
      Notes: parenthesizeOrEmpty(sb.armor_desc)
    },
    InitiativeModifier: 0,
    Speed: Object.keys(sb.speed ?? {}).map(speedType => {
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
    Skills: Object.keys(sb.skills ?? {}).map(skillName => {
      return {
        Name: _.startCase(skillName),
        Modifier: sb.skills[skillName]
      };
    }),
    Senses: commaSeparatedStrings(sb.senses),
    Languages: commaSeparatedStrings(sb.languages),
    Challenge: normalizeChallengeRating(sb.challenge_rating),
    Traits: nameAndDescArrays(sb.special_abilities),
    Actions: nameAndDescArrays(sb.actions),
    BonusActions: nameAndDescArrays(sb.bonus_actions),
    LegendaryActions: nameAndDescArrays(sb.legendary_actions),
    MythicActions: nameAndDescArrays(sb.mythic_actions),
    Reactions: nameAndDescArrays(sb.reactions)
  };
}

export function ImportOpen5eSpell(open5eSpell: Record<string, any>): Spell {
  const spell = {
    ...Spell.Default(),
    Name: open5eSpell.name,
    Source: open5eSpell.document__title,
    Level: open5eSpell.level_int,
    School: open5eSpell.school,
    CastingTime: open5eSpell.casting_time,
    Range: open5eSpell.range,
    Components: open5eSpell.components,
    Duration: open5eSpell.duration,
    Classes: open5eSpell.dnd_class.split(", "),
    Description: open5eSpell.desc + "\n\n" + open5eSpell.higher_level,
    Ritual: open5eSpell.ritual === "yes" || open5eSpell.ritual === true
  };

  return spell;
}

function parenthesizeOrEmpty(input: string | undefined) {
  if (!input || !input.length) {
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
  if (!entries?.map) {
    return [];
  }
  return entries.map(getNameAndContent);
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

function getType(data: any): string {
  // Strip any trailing text after the last comma,
  // to remove any source information
  let typeString = data.type;
  const pos = typeString.lastIndexOf(",");
  if (pos != -1) {
    typeString = typeString.substr(0, pos);
  }
  const sizeString = data.size;
  if (sizeString) {
    typeString = sizeString + " " + typeString;
  }
  const alignment = data.alignment;
  if (alignment) {
    typeString = typeString + ", " + alignment;
  }
  return typeString;
}

export function ImportOpen5eV2StatBlock(
  open5eStatBlock: Record<string, any>
): StatBlock {
  // https://api.open5e.com/v2/creatures/?document__key=srd-2024&limit=20
  const sb = open5eStatBlock;
  return {
    ...StatBlock.Default(),
    Name: sb.name,
    Source: sb.document.display_name,
    Type: getTypeV2(sb),
    HP: {
      Value: sb.hit_points,
      Notes: parenthesizeOrEmpty(sb.hit_dice)
    },
    AC: {
      Value: sb.armor_class,
      Notes: parenthesizeOrEmpty(sb.armor_detail)
    },
    InitiativeModifier:
      (sb.initiative_bonus ?? 0) - (sb.modifiers?.dexterity ?? 0),
    Speed: getSpeedV2(sb),
    Abilities: {
      Str: sb.ability_scores.strength,
      Dex: sb.ability_scores.dexterity,
      Con: sb.ability_scores.constitution,
      Int: sb.ability_scores.intelligence,
      Wis: sb.ability_scores.wisdom,
      Cha: sb.ability_scores.charisma
    },
    DamageVulnerabilities:
      sb.resistances_and_immunities.damage_vulnerabilities.map(v => v.name),
    DamageResistances: sb.resistances_and_immunities.damage_resistances.map(
      v => v.name
    ),
    DamageImmunities: sb.resistances_and_immunities.damage_immunities.map(
      v => v.name
    ),
    ConditionImmunities: sb.resistances_and_immunities.condition_immunities.map(
      v => v.name
    ),
    Saves: Object.keys(sb.saving_throws ?? {}).map(saveName => {
      return {
        Name: _.startCase(saveName),
        Modifier: sb.saving_throws[saveName]
      };
    }),
    Skills: Object.keys(sb.skill_bonuses ?? {}).map(skillName => {
      return {
        Name: _.startCase(skillName),
        Modifier: sb.skill_bonuses[skillName]
      };
    }),
    Senses: getSensesV2(sb),
    Languages: commaSeparatedStrings(sb.languages.as_string),
    Challenge: normalizeChallengeRating(sb.challenge_rating),
    Traits: nameAndDescArraysV2(sb.traits),
    Actions: nameAndDescArraysV2(
      sb.actions.filter(a => a.action_type === "ACTION")
    ),
    BonusActions: nameAndDescArraysV2(
      sb.actions.filter(a => a.action_type === "BONUS_ACTION")
    ),
    LegendaryActions: nameAndDescArraysV2(
      sb.actions.filter(a => a.action_type === "LEGENDARY_ACTION")
    ),
    MythicActions: nameAndDescArraysV2(
      sb.actions.filter(a => a.action_type === "MYTHIC_ACTION")
    ),
    Reactions: nameAndDescArraysV2(
      sb.actions.filter(a => a.action_type === "REACTION")
    )
  };
}

function getTypeV2(data: any): string {
  const sizeString = data.size.name;
  const typeString = data.type.name;
  const alignmentString = data.alignment;
  let fullType = "";
  if (sizeString) {
    fullType += sizeString + " ";
  }
  fullType += typeString;
  if (alignmentString) {
    fullType += ", " + alignmentString;
  }
  return fullType;
}

function getSpeedV2(data: any): string[] {
  const speeds: string[] = [];
  const { unit, fly, hover, ...rest } = data.speed;
  for (const speedType in rest) {
    speeds.push(`${speedType} ${data.speed[speedType]} ${unit}`);
  }
  if (fly) {
    speeds.push(`fly ${data.speed.fly} ${unit}` + (hover ? " (hover)" : ""));
  }
  return speeds;
}

function getSensesV2(data: any): string[] {
  const senses: string[] = [];
  if (data.darkvision_range) {
    senses.push(`darkvision ${data.darkvision_range} ft.`);
  }
  if (data.tremorsense_range) {
    senses.push(`tremorsense ${data.tremorsense_range} ft.`);
  }
  if (data.truesight_range) {
    senses.push(`truesight ${data.truesight_range} ft.`);
  }
  if (data.blindsight_range) {
    senses.push(`blindsight ${data.blindsight_range} ft.`);
  }
  return senses;
}

function nameAndDescArraysV2(entries: any): NameAndContent[] {
  if (!entries?.map) {
    return [];
  }
  return entries.map(getNameAndContentV2);
}

function getNameAndContentV2(data: {
  name: string;
  desc: string;
}): NameAndContent {
  return {
    Name: data.name,
    Content: data.desc
  };
}
