import { IRules } from "../Rules";
import { FormulaTerm } from "./FormulaTerm";

export class Constant implements FormulaTerm {
  private readonly Value: number;
  public readonly HasStaticResult = true;
  public readonly RequiresStats = false;
  public Evaluate = () => this.Value;
  public EvaluateStatic = this.Evaluate;

  public FormulaString(): string {
    return `${this.Value}`;
  }
  constructor(str: string, rules: IRules) {
    const results = Constant.Pattern.exec(str);
    if (results === null) {
      throw `Constant did not match a number in ${str}`;
    }
    this.Value = Number.parseInt(results[0], 10);
  }
  public static readonly Pattern = /-?\d+/;
  public static readonly TestPattern = /-?\d+(?!d)/;
}
