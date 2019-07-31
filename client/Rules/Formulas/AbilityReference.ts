import { AbilityScores, StatBlock } from "../../../common/StatBlock";
import { DefaultRules, IRules } from "../Rules";
import { FormulaTerm } from "./FormulaTerm";

export class AbilityReference implements FormulaTerm {
  private GetModifier: (score: number) => number;
  private Get(stats: StatBlock) {
    return this.GetModifier(stats.Abilities[this.Key]);
  }
  private readonly OriginalLabel: string;
  private readonly Key: keyof AbilityScores;
  private static KeyForPattern(pattern: string): keyof AbilityScores {
    switch (pattern) {
      case "STR":
        return "Str";
      case "DEX":
        return "Dex";
      case "CON":
        return "Con";
      case "INT":
        return "Int";
      case "WIS":
        return "Wis";
      case "CHA":
        return "Cha";
      default:
        throw `Illegal ability score name ${pattern}`;
    }
  }
  public readonly HasStaticResult = true;
  public readonly RequiresStats = true;
  public Evaluate(stats?: StatBlock) {
    if (!stats) {
      throw `Ability reference can't be calculated without StatBlock context!`;
    }
    const score = this.Get(stats);
    return {
      Total: score,
      String: `${this.Key} (${score})`,
      FormattedString: this.WrapFormatting(score)
    };
  }
  public EvaluateStatic = this.Evaluate;
  public FormulaString(): string {
    return `${this.Key}`;
  }
  public Annotated(stats?: StatBlock) {
    return this.WrapFormatting(stats ? this.Get(stats) : "?");
  }
  public WrapFormatting(inner: any) {
    return `${inner}<sup>${this.Key}</sup>`;
  }
  public static readonly Pattern = /\{(STR|DEX|CON|INT|WIS|CHA)\}/;
  public static TestPattern = /\{(?:STR|DEX|CON|INT|WIS|CHA)\}/;
  constructor(str: string, rules?: IRules) {
    const result = AbilityReference.Pattern.exec(str);
    if (!result) {
      throw `${str} did not match any known ability modifier`;
    }
    this.OriginalLabel = result[1];
    this.Key = AbilityReference.KeyForPattern(result[1]);

    rules = rules || new DefaultRules();
    this.GetModifier = rules.GetModifierFromScore;
  }
}
