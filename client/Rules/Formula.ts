import { StatBlock, AbilityScores } from "../../common/StatBlock";
import { IRules } from "./Rules";

export interface FormulaTerm {
  HasStaticResult: boolean;
  RequiresStats: boolean;
  Evaluate: (stats?: StatBlock) => number;
  FormulaString: () => string;
  // AnnotatedString: (stats: StatBlock) => string;
  EvaluateStatic: (stats?: StatBlock) => number;
}

interface TermAnnotation {
  ModifyTotal: (r: number) => number;
  ModifyString: (s: string) => string;
}

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

export class AbilityReference implements FormulaTerm {
  private GetModifier: (score: number) => number; // TODO: where does this get injected?
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
    return this.GetModifier(stats.Abilities[this.Key]);
  }
  public EvaluateStatic = this.Evaluate;
  public FormulaString(): string {
    return `${this.Key}`;
  }
  public static readonly Pattern = /\[(STR|DEX|CON|INT|WIS|CHA)\]/;
  public static TestPattern = /\[(?:STR|DEX|CON|INT|WIS|CHA)\]/;
  constructor(match: string, rules: IRules) {
    const result = AbilityReference.Pattern.exec(match);
    this.Key = AbilityReference.KeyForPattern(result[1]);
    this.GetModifier = rules.GetModifierFromScore;
  }
}

export class StatReference implements FormulaTerm {
  private readonly OriginalMatch: string;
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
    return StatReference.Extract(stats, this.Key);
  }
  public EvaluateStatic = this.Evaluate;
  public static readonly Pattern = /\[(PROF|SPELL|LVL)]/;
  public static TestPattern = /\[(?:PROF|SPELL|LVL)\]/;
  constructor(match: string, rules: IRules) {
    const result = StatReference.Pattern.exec(match);
    this.Key = StatReference.KeyForPattern(result[1]);
  }
}

interface FormulaClass {
  Pattern: RegExp;
  TestPattern: RegExp;
  new (text: string, rules: IRules): FormulaTerm;
}

export class Formula implements FormulaTerm {
  private readonly Terms: FormulaTerm[] = [];
  private readonly Coefficients: WeakMap<FormulaTerm, number> = new WeakMap();
  private GetCoefficient(t: FormulaTerm): number {
    return this.Coefficients.has(t) ? this.Coefficients.get(t) : 1;
  }
  public get HasStaticResult(): boolean {
    return this.Terms.every((t: FormulaTerm) => t.HasStaticResult);
  }
  public get RequiresStats(): boolean {
    return this.Terms.some((t: FormulaTerm) => t.RequiresStats);
  }
  public Evaluate(stats?: StatBlock): number {
    return this.Terms.reduce(
      (sum: number, t: FormulaTerm) =>
        sum + this.GetCoefficient(t) * t.Evaluate(stats),
      0
    );
  }
  public EvaluateStatic = this.Evaluate;

  constructor(str: string, rules: IRules) {
    // console.warn("Building formula for string: "+str);
    // console.warn(`against regex ${Formula.Pattern.source}`);
    const matches = Formula.Pattern.test(str);
    if (!matches) {
      throw "Top-level formula pattern does not match!";
    }
    const formulaMatch: RegExpExecArray = Formula.Pattern.exec(str);
    const formulaString = formulaMatch[0];

    const TermWithOperatorPattern = new RegExp(
      "([+-])?\\s*(" + Formula.TermPattern.source + ")",
      "g"
    );

    let termMatch = TermWithOperatorPattern.exec(formulaString);
    while (termMatch !== null) {
      // console.warn(`${termMatch[0]}: ${termMatch[1]} , ${termMatch[2]}`);
      const term = Formula.BuildTerm(termMatch[2], rules);
      const coeff = termMatch[1] == "-" ? -1 : 1;
      this.Terms.push(term);
      this.Coefficients.set(term, coeff);

      termMatch = TermWithOperatorPattern.exec(formulaString);
    }
  }
  private static TermClasses: FormulaClass[] = [
    Die,
    AbilityReference,
    StatReference,
    Constant
  ];
  public static TermPattern = new RegExp(
    Formula.TermClasses.map((fc: FormulaClass) => fc.TestPattern.source).join(
      "|"
    )
  );
  public static readonly Pattern = new RegExp(
    "\\s*(?:[+-]?(?:\\s*" +
      Formula.TermPattern.source +
      "))\\s*(?:[+-]\\s*(?:" +
      Formula.TermPattern.source +
      ")\\s*)*"
  );

  public static BuildTerm(subpattern: string, rules: IRules): FormulaTerm {
    for (let i = 0; i < Formula.TermClasses.length; i++) {
      if (Formula.TermClasses[i].TestPattern.test(subpattern)) {
        return new Formula.TermClasses[i](subpattern, rules);
      }
    }
    throw `Could not identify term formula for "${subpattern}"`;
  }

  public FormulaString(): string {
    return this.Terms.map((t: FormulaTerm, i: number) => {
      if (this.GetCoefficient(t) < 0) {
        return `-${t.FormulaString()}`;
      }
      if (i > 0) {
        return `+${t.FormulaString()}`;
      }
      return t.FormulaString();
    }).join("");
  }
}
