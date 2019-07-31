import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { StatBlock } from "../../../common/StatBlock";
import { IRules } from "../Rules";
import { FormulaTerm } from "./FormulaTerm";

const Defaults = {
  ProficiencyBonus: 0,
  SpellcastingAbility: 0,
  Challenge: 1
};
const ShortNames = {
  SpellcastingAbility: "Spellcasting",
  ProficiencyBonus: "Prof",
  Challenge: "Lvl"
};

export class StatReference implements FormulaTerm {
  private readonly OriginalLabel: string;
  private readonly Key: keyof StatBlock;
  private Get(stats: StatBlock) {
    return StatReference.ExtractOrDefault(stats, this.Key);
  }
  private static KeyForPattern(pattern: string): keyof StatBlock {
    switch (pattern) {
      case "PROF":
        return "ProficiencyBonus";
      case "SPELL":
        return "SpellcastingAbility";
      case "LVL":
        return "Challenge";
      default:
        throw `Illegal stat reference ${pattern}`;
    }
  }
  private static Extract(stats: StatBlock, key: keyof StatBlock): number {
    switch (key) {
      case "ProficiencyBonus":
      case "SpellcastingAbility":
        return stats[key];
      case "Challenge":
        return PersistentCharacter.GetTotalLevelFromString(stats[key]);
      default:
        throw `Illegal StatBlock key ${key}`;
    }
  }
  private static ExtractOrDefault(
    stats: StatBlock,
    key: keyof StatBlock
  ): number {
    return StatReference.Extract(stats, key) || Defaults[key];
  }
  public readonly HasStaticResult = true;
  public readonly RequiresStats = true;
  public FormulaString(): string {
    return `${this.Key}`;
  }
  public Evaluate(stats?: StatBlock) {
    if (!stats) {
      throw `Stat reference can't be calculated without StatBlock context!`;
    }
    const stat = this.Get(stats);
    return {
      Total: stat,
      String: `${this.Key} (${stat})`,
      FormattedString: this.WrapFormatting(stat)
    };
  }
  public Annotated(stats?: StatBlock) {
    return this.WrapFormatting(stats ? this.Get(stats) : "?");
  }
  public WrapFormatting(inner: any) {
    return `${inner}<sup>${ShortNames[this.Key]}</sup>`;
  }
  public EvaluateStatic = this.Evaluate;
  public static readonly Pattern = /\{(PROF|SPELL|LVL)}/;
  public static TestPattern = /\{(?:PROF|SPELL|LVL)}/;
  constructor(match: string, rules?: IRules) {
    const result = StatReference.Pattern.exec(match);
    this.OriginalLabel = result[1];
    this.Key = StatReference.KeyForPattern(result[1]);
  }
}
