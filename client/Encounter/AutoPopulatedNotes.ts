import { NameAndContent, StatBlock } from "../../common/StatBlock";

export function AutoPopulatedNotes(statBlock: StatBlock): string {
  const notes = [];
  let match = [];

  const spellcasting = statBlock.Traits.find(t => t.Name === "Spellcasting");
  if (spellcasting) {
    notes.push("Spellcasting Slots");
    const content = spellcasting.Content;

    const spellPattern = /([1-9])(st|nd|rd|th) level \(([1-9])/gm;
    while ((match = spellPattern.exec(content))) {
      notes.push(`${match[1]}${match[2]} Level [${match[3]}/${match[3]}]`);
    }
  }

  const innateSpellcasting = statBlock.Traits.find(
    t => t.Name === "Innate Spellcasting"
  );

  if (innateSpellcasting) {
    notes.push("Innate Spellcasting Slots");

    const content = innateSpellcasting.Content;

    const innatePattern = /(\d)\/day/gim;
    while ((match = innatePattern.exec(content))) {
      notes.push(`[${match[1]}/${match[1]}]`);
    }
  }

  if (statBlock.LegendaryActions.length > 0) {
    notes.push("Legendary Actions [3/3]");
  }

  notes.push(...GetDailyCounters(statBlock.Traits));
  notes.push(...GetRechargeCounters(statBlock.Traits));

  notes.push(...GetDailyCounters(statBlock.Actions));
  notes.push(...GetRechargeCounters(statBlock.Actions));

  notes.push(...GetDailyCounters(statBlock.Reactions));
  notes.push(...GetRechargeCounters(statBlock.Reactions));

  if (statBlock.BonusActions) {
    notes.push(...GetDailyCounters(statBlock.BonusActions));
    notes.push(...GetRechargeCounters(statBlock.BonusActions));
  }

  return notes.join("\n\n");
}

function GetDailyCounters(statBlockEntries: NameAndContent[]) {
  const perDayPattern = /\((\d)\/day\)/gim;
  return statBlockEntries
    .filter(t => t.Name.match(perDayPattern))
    .map(t => `${t.Name.replace(perDayPattern, "[$1/$1]")}`);
}

function GetRechargeCounters(statBlockEntries: NameAndContent[]) {
  return statBlockEntries
    .filter(t => t.Name.includes("(Recharge"))
    .map(t => `${t.Name.replace(/\(.*?\)/, "")}[1/1]`);
}
