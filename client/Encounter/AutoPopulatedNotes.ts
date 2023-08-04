import { StatBlock } from "../../common/StatBlock";

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

  const perDayPattern = /\((\d)\/day\)/gim;

  statBlock.Traits.filter(t => t.Name.match(perDayPattern)).forEach(t =>
    notes.push(`${t.Name.replace(perDayPattern, "[$1/$1]")}`)
  );

  perDayPattern.lastIndex = 0;

  statBlock.Actions.filter(t => t.Name.match(perDayPattern)).forEach(t =>
    notes.push(`${t.Name.replace(perDayPattern, "[$1/$1]")}`)
  );

  statBlock.Traits.filter(t => t.Name.includes("(Recharge")).forEach(t =>
    notes.push(`${t.Name.replace(/\(.*?\)/, "")}[1/1]`)
  );
  statBlock.Actions.filter(t => t.Name.includes("(Recharge")).forEach(t =>
    notes.push(`${t.Name.replace(/\(.*?\)/, "")}[1/1]`)
  );

  return notes.join("\n\n");
}
