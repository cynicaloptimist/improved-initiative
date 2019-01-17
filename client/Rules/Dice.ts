import { RollResult } from "./RollResult";

export class Dice {
  public static readonly ValidDicePattern = /(\d+)d(\d+)[\s]*([+-][\s]*\d+)?|([+-][\s]*\d+)/;
  public static readonly GlobalDicePattern = /(\d+d\d+(?:[\s]*[+-][\s]*\d+)?|[+-][\s]*\d+)/g;
  public static readonly RollDiceExpression = (expression: string) => {
    //Taken from http://codereview.stackexchange.com/a/40996
    const match = Dice.ValidDicePattern.exec(expression);
    if (!match) {
      throw "Invalid dice notation: " + expression;
    }
    const isLooseModifier = typeof match[4] == "string";
    if (match[4] && isLooseModifier) {
      const modifier = parseInt(match[4].replace(/[\s]*/g, ""));
      const d20Roll = Math.ceil(Math.random() * 20);
      return new RollResult([d20Roll], modifier, 20);
    }
    const howMany = typeof match[1] == "undefined" ? 1 : parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const rolls = [];
    for (let i = 0; i < howMany; i++) {
      rolls[i] = Math.ceil(Math.random() * dieSize);
    }
    const modifier =
      typeof match[3] == "undefined"
        ? 0
        : parseInt(match[3].replace(/[\s]*/g, ""));
    return new RollResult(rolls, modifier, dieSize);
  };
}
