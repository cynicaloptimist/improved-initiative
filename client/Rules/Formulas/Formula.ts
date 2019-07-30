import { StatBlock } from "../../../common/StatBlock";
import { IRules } from "../Rules";
import { AbilityReference } from "./AbilityReference";
import { Constant } from "./Constant";
import { Die } from "./Die";
import { FormulaClass, FormulaResult, FormulaTerm } from "./FormulaTerm";
import { StatReference } from "./StatReference";

export class Formula implements FormulaTerm {
  protected static BuildTermPatternFromClasses(termClasses: FormulaClass[]) {
    return new RegExp(
      termClasses.map((fc: FormulaClass) => fc.TestPattern.source).join("|")
    );
  }
  protected static BuildFullPatternFromTerms(
    termExp: RegExp,
    asFullStringMatch = false
  ): RegExp {
    return new RegExp(
      (asFullStringMatch ? "^" : "") +
        "(\\s*(?:[+-]?(?:\\s*" +
        termExp.source +
        "))\\s*(?:[+-]\\s*(?:" +
        termExp.source +
        ")\\s*)*)" +
        (asFullStringMatch ? "$" : "")
    );
  }
  protected static readonly DefaultTermClasses: FormulaClass[] = [
    Die,
    AbilityReference,
    StatReference,
    Constant
  ];
  public static readonly DefaultTermPattern = Formula.BuildTermPatternFromClasses(
    Formula.DefaultTermClasses
  );
  public static readonly DefaultPattern = Formula.BuildFullPatternFromTerms(
    Formula.DefaultTermPattern
  );
  public static readonly WholeStringMatch = Formula.BuildFullPatternFromTerms(
    Formula.DefaultTermPattern,
    true
  );

  protected readonly TermClasses: FormulaClass[];
  protected readonly TermPattern: RegExp;
  protected readonly Pattern: RegExp;

  protected readonly Terms: FormulaTerm[] = [];
  protected BuildTerm(subpattern: string, rules: IRules): FormulaTerm {
    for (let i = 0; i < this.TermClasses.length; i++) {
      if (this.TermClasses[i].TestPattern.test(subpattern)) {
        return new this.TermClasses[i](subpattern, rules);
      }
    }
    throw `Could not identify term formula for "${subpattern}"`;
  }

  protected readonly Coefficients: WeakMap<FormulaTerm, number> = new WeakMap();
  private GetCoefficient(t: FormulaTerm): number {
    return this.Coefficients.has(t) ? this.Coefficients.get(t) : 1;
  }

  constructor(
    str: string,
    rules?: IRules,
    termClasses: FormulaClass[] = Formula.DefaultTermClasses
  ) {
    this.TermClasses = termClasses;
    this.TermPattern = Formula.BuildTermPatternFromClasses(termClasses);
    this.Pattern = Formula.BuildFullPatternFromTerms(this.TermPattern);

    const matches = this.Pattern.test(str);
    if (!matches) {
      throw `Top-level formula pattern (${str}) does not match!`;
    }
    const formulaMatch: RegExpExecArray = this.Pattern.exec(str);
    const formulaString = formulaMatch[0];

    const termWithOperatorPattern = new RegExp(
      "([+-])?\\s*(" + this.TermPattern.source + ")",
      "g"
    );

    let termMatch = termWithOperatorPattern.exec(formulaString);
    while (termMatch !== null) {
      const term = this.BuildTerm(termMatch[2], rules);
      const coeff = termMatch[1] == "-" ? -1 : 1;
      this.Terms.push(term);
      this.Coefficients.set(term, coeff);

      termMatch = termWithOperatorPattern.exec(formulaString);
    }
  }

  public get HasStaticResult(): boolean {
    return this.Terms.every((t: FormulaTerm) => t.HasStaticResult);
  }
  public get RequiresStats(): boolean {
    return this.Terms.some((t: FormulaTerm) => t.RequiresStats);
  }
  public Evaluate(
    stats?: StatBlock,
    withPrefix?: FormulaTerm[]
  ): FormulaResult {
    const result: FormulaResult = {
      Total: 0,
      String: "",
      FormattedString: ""
    };
    withPrefix = withPrefix || [];
    withPrefix.concat(this.Terms).forEach((term: FormulaTerm, i: number) => {
      let termResult = term.Evaluate(stats);
      (result.Total += this.GetCoefficient(term) * termResult.Total),
        (result.String += ` ${this.CoefficientPrefix(term, i === 0)}${
          termResult.String
        }`);
      result.FormattedString += ` ${this.CoefficientPrefix(term, i === 0)}${
        termResult.FormattedString
      }`;
    });
    result.String = result.String.trim(); // + ` = ${result.Total}`;
    result.FormattedString = result.FormattedString.trim(); // + ` = <em>${result.Total}</em>`;
    return result;
  }
  public RollCheck(stats?: StatBlock): FormulaResult {
    if (this.HasStaticResult) {
      // assume the expression is a modifier for a base d20
      return this.Evaluate(stats, [Die.Default]);
    }
    return this.Evaluate(stats);
  }
  public EvaluateStatic = this.Evaluate;

  public FormulaString(stats?: StatBlock): string {
    // TODO: make this match formatted string in result!
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
  protected CoefficientPrefix(t: FormulaTerm, isFirst: boolean): string {
    const coeff = this.GetCoefficient(t);
    switch (coeff) {
      case 1:
        return isFirst ? "" : "+ ";
      case -1:
        return "- ";
      default:
        if (coeff < 0) {
          return `- ${Math.abs(coeff)}×`;
        }
        return `${isFirst ? "" : "+ "}${coeff}×`;
    }
  }
}

export class ReferenceFreeFormula extends Formula {
  protected static TermClasses: FormulaClass[] = [Die, Constant];
  public static readonly Pattern = Formula.BuildFullPatternFromTerms(
    Formula.BuildTermPatternFromClasses(ReferenceFreeFormula.DefaultTermClasses)
  );

  constructor(str: string, rules?: IRules) {
    super(str, rules, ReferenceFreeFormula.TermClasses);
  }
}

export class DieFreeFormula extends Formula {
  protected static TermClasses: FormulaClass[] = [
    AbilityReference,
    StatReference,
    Constant
  ];
  public static readonly WholeStringMatch = Formula.BuildFullPatternFromTerms(
    Formula.BuildTermPatternFromClasses(
      ReferenceFreeFormula.DefaultTermClasses
    ),
    true
  );

  constructor(str: string, rules?: IRules) {
    super(str, rules, DieFreeFormula.TermClasses);
  }
}

export const QuickRoll = (
  formulaExpression: string,
  statGetter: () => StatBlock | null,
  rules?: IRules
) => {
  const formula = new Formula(formulaExpression, rules);
  if (formula.RequiresStats) {
    const stats = statGetter();
    if (stats === null) {
      return null;
    }
    return formula.RollCheck(stats);
  }
  return formula.RollCheck();
};
