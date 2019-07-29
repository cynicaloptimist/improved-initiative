import { AbilityScores, StatBlock } from "../../../common/StatBlock";
import { IRules } from "../Rules";

export interface FormulaTerm {
  HasStaticResult: boolean;
  RequiresStats: boolean;
  Evaluate: (stats?: StatBlock) => number;
  FormulaString: () => string;
  // AnnotatedString: (stats: StatBlock) => string;
  EvaluateStatic: (stats?: StatBlock) => number;
}

export interface FormulaClass {
  Pattern: RegExp;
  TestPattern: RegExp;
  new (text: string, rules: IRules): FormulaTerm;
}
