import { DefaultRules, IRules } from "../Rules";
import { FormulaResult, FormulaTerm } from "./FormulaTerm";

const MAX_CONCURRENT_DICE = 1023;

export class Die implements FormulaTerm {
  private readonly Multiplier: number = 1;
  private readonly Faces: number;
  private readonly Rolls: number[] = [];
  public readonly HasStaticResult = false;
  public readonly RequiresStats = false;
  public Evaluate(): FormulaResult {
    if (!Number.isSafeInteger(this.Faces) || this.Faces < 1) {
      throw `Die must have a positive integer number of faces (got ${
        this.Faces
      }`;
    }
    if (!Number.isSafeInteger(this.Multiplier) || this.Multiplier < 1) {
      throw `Number of dice must be a positive integer (got ${this.Multiplier}`;
    }
    if (this.Multiplier > MAX_CONCURRENT_DICE) {
      throw `Due to memory requirements, cannot roll more than ${MAX_CONCURRENT_DICE} dice at once`;
    }

    for (let i = 0; i < this.Multiplier; i++) {
      this.Rolls.push(Die.RollOne(this.Faces));
    }
    // this.Rolls.concat(Array.apply(() => Die.RollOne(this.Faces), Array(this.Multiplier)));

    return {
      Total: this.Rolls.reduce((acc: number, roll: number) => acc + roll),
      String: `[${this.Rolls}]`,
      FormattedString: `[${this.FormattedRolls}]`
    };
  }
  public static RollOne(faces: number): number {
    if (!Number.isSafeInteger(faces) || faces < 1) {
      throw `Die must have a positive integer number of faces (got ${faces}`;
    }
    return Math.ceil(Math.random() * faces);
  }
  private get FormattedRolls(): string {
    return this.Rolls.map(r => {
      if (r == this.Faces) {
        return `<span class='s-roll-max'>${r}</span>`;
      }
      if (r == 1) {
        return `<span class='s-roll-min'>${r}</span>`;
      }
      return `<span class='s-roll'>${r}</span>`;
    }).join(", ");
  }
  public EvaluateStatic(): never {
    throw "Cannot statically evaluate a die roll";
  }
  public FormulaString(): string {
    return `${this.Multiplier}d${this.Faces}`;
  }

  public static readonly Pattern = /(\d+)d(\d+)/;
  public static readonly TestPattern = /\d+d\d+/;
  constructor(str: string) {
    const results = Die.Pattern.exec(str);
    this.Multiplier = Number.parseInt(results[1], 10);
    this.Faces = Number.parseInt(results[2], 10);
  }
  public static readonly Default = new Die("1d20");
}
