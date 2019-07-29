import { StatBlock } from "../../../common/StatBlock";
import { IRules } from "../Rules";
import { AbilityReference } from "./AbilityReference";
import { Constant } from "./Constant";
import { Die } from "./Die";
import { FormulaClass, FormulaResult, FormulaTerm } from "./FormulaTerm";
import { StatReference } from "./StatReference";

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
  public Evaluate(stats?: StatBlock): FormulaResult {
    const result: FormulaResult = {
      Total: 0,
      String: "",
      FormattedString: ""
    };
    this.Terms.forEach((term: FormulaTerm, i: number) =>
      {
        let termResult = term.Evaluate(stats);
        result.Total += (this.GetCoefficient(term) * termResult.Total),
        result.String
          += ` ${this.CoefficientPrefix(term,i === 0)}${termResult.String}`
        result.FormattedString
          += ` ${this.CoefficientPrefix(term,i === 0)}${termResult.FormattedString}`
      });
    result.String = result.String.trim();
    result.FormattedString = result.FormattedString.trim();
    return result;
  }
  public RollCheck(stats?: StatBlock): FormulaResult {
    if (this.HasStaticResult)
    {
      // assume the expression is a modifier for a base d20
      const result = this.Evaluate(stats);
      const d20 = Die.Default.Evaluate();
      result.Total += d20.Total;
      result.String = d20.String + ' ' + result.String;
      result.FormattedString = d20.FormattedString + ' ' + result.FormattedString;
      return result;
    }
    return this.Evaluate(stats);
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
  private CoefficientPrefix(t: FormulaTerm, isFirst: boolean): string
  {
    const coeff = this.GetCoefficient(t);
    switch (coeff)
    {
      case 1: return isFirst ? '' : '+ ';
      case -1: return '- ';
      default:
        if (coeff < 0)
        {
          return `- ${Math.abs(coeff)}×`;
        }
        return `${isFirst ? '' : '+ '}${coeff}×`;
    }
  }
}
