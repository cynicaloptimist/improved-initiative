import { StatBlock } from "../../../common/StatBlock";
import { IRules } from "../Rules";
import { FormulaTerm } from "./FormulaTerm";

export class StatReference implements FormulaTerm {
  private readonly OriginalLabel: string;
  private readonly Key: keyof StatBlock;
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
        return Number.parseInt(stats[key]);
      default:
        throw `Illegal StatBlock key ${key}`;
    }
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
    return {
      Total: StatReference.Extract(stats, this.Key),
      String: `${this.Key} (${StatReference.Extract(stats, this.Key)})`,
      FormattedString: `${StatReference.Extract(stats, this.Key)}<sub>${
        this.Key
      }</sub>`
    };
  }
  public EvaluateStatic = this.Evaluate;
  public static readonly Pattern = /\{(PROF|SPELL|LVL)}/;
  public static TestPattern = /\{(?:PROF|SPELL|LVL)\}/;
  constructor(match: string, rules?: IRules) {
    const result = StatReference.Pattern.exec(match);
    this.OriginalLabel = result[1];
    this.Key = StatReference.KeyForPattern(result[1]);
  }
}
