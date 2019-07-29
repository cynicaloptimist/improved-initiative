import { IRules } from "../Rules";
import { FormulaTerm } from "./FormulaTerm";

export class Die implements FormulaTerm {
  private readonly Multiplier: number = 1;
  private readonly Faces: number;
  public readonly HasStaticResult = false;
  public readonly RequiresStats = false;
  public Evaluate(): number {
    let sum = 0;
    for (let i = 0; i < this.Multiplier; i++) {
      sum += this.RollOnce();
    }
    return sum;
  }
  public EvaluateStatic(): never {
    throw "Cannot statically evaluate a die roll";
  }
  private RollOnce(): number {
    return Math.ceil(Math.random() * this.Faces);
  }
  public FormulaString(): string {
    return `${this.Multiplier}d${this.Faces}`;
  }

  public static readonly Pattern = /(\d+)d(\d+)/;
  public static readonly TestPattern = /\d+d\d+/;
  constructor(str: string, rules: IRules) {
    const results = Die.Pattern.exec(str);
    this.Multiplier = Number.parseInt(results[1], 10);
    this.Faces = Number.parseInt(results[2], 10);
  }
}
