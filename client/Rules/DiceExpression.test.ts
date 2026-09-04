import { DiceRoll, RollModes } from "./Dice";
import {
  GlobalDicePattern,
  getExpressionMax,
  isValidDiceExpression,
  parseExpression,
  rollExpression,
  toExpression
} from "./DiceExpression";

describe("parseExpression", () => {
  test.each([
    { expression: "1d20", diceCount: 1, dieSize: 20, modifier: 0 },
    { expression: " 3d6 + 2 ", diceCount: 3, dieSize: 6, modifier: 2 },
    { expression: "2d8 - 3", diceCount: 2, dieSize: 8, modifier: -3 },
    { expression: "+5", diceCount: 1, dieSize: 20, modifier: 5 },
    { expression: "- 4", diceCount: 1, dieSize: 20, modifier: -4 }
  ])("parses $expression", ({ expression, diceCount, dieSize, modifier }) => {
    expect(parseExpression(expression)).toEqual({
      diceCount,
      dieSize,
      modifier,
      mode: undefined
    });
  });

  test.each([
    {
      expression: "adv:8d6 + 5",
      diceCount: 8,
      dieSize: 6,
      mode: RollModes.Advantage,
      modifier: 5
    },
    {
      expression: "dis:2d100 - 4",
      diceCount: 2,
      dieSize: 100,
      mode: RollModes.Disadvantage,
      modifier: -4
    },
    {
      expression: " adv:+5 ",
      diceCount: 1,
      dieSize: 20,
      mode: RollModes.Advantage,
      modifier: 5
    }
  ])(
    "parses dice and mode independently for $expression",
    ({ expression, diceCount, dieSize, mode, modifier }) => {
      expect(parseExpression(expression)).toEqual({
        diceCount,
        dieSize,
        modifier,
        mode
      });
    }
  );

  test("rejects invalid notation", () => {
    expect(() => parseExpression("not dice")).toThrow(
      "Invalid dice notation: not dice"
    );
  });
});

describe("getExpressionMax", () => {
  test.each([
    { expression: "1d20", maximum: 20 },
    { expression: "2d6", maximum: 12 },
    { expression: "3d12 + 4", maximum: 40 },
    { expression: "2d8 - 3", maximum: 13 },
    { expression: "+5", maximum: 25 }
  ])("calculates the maximum for $expression", ({ expression, maximum }) => {
    expect(getExpressionMax(expression)).toBe(maximum);
  });

  test("rejects invalid notation", () => {
    expect(() => getExpressionMax("not dice")).toThrow(
      "Invalid dice notation: not dice"
    );
  });
});

describe("rollExpression", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("creates a roll from the parsed dice and modifier", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);

    const roll = rollExpression("3d6 + 2");

    expect(roll.ToResultString()).toBe("[4,4,4] + 2 = 14");
  });

  test("passes the parsed mode to the roll", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999);

    const roll = rollExpression("adv:1d20 + 5");

    expect(roll.ToResultString()).toBe("[1,20]a + 5 = 25");
  });
});

describe("isValidDiceExpression", () => {
  test.each(["1d20", "2d6 + 3", "+5", "adv:1d20", "dis:1d20 - 2"])(
    "accepts %s",
    expression => {
      expect(isValidDiceExpression(expression)).toBe(true);
    }
  );

  test.each(["", "df", "adv:not dice"])("rejects %s", expression => {
    expect(isValidDiceExpression(expression)).toBe(false);
  });
});

describe("toExpression", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    { diceCount: 2, dieSize: 6, modifier: 0, mode: undefined, expected: "2d6" },
    {
      diceCount: 1,
      dieSize: 20,
      modifier: 5,
      mode: undefined,
      expected: "1d20+5"
    },
    {
      diceCount: 1,
      dieSize: 20,
      modifier: 5,
      mode: RollModes.Advantage,
      expected: "adv:1d20+5"
    },
    {
      diceCount: 1,
      dieSize: 20,
      modifier: -4,
      mode: RollModes.Disadvantage,
      expected: "dis:1d20-4"
    }
  ])(
    "formats $expected",
    ({ diceCount, dieSize, modifier, mode, expected }) => {
      jest.spyOn(Math, "random").mockReturnValue(0);
      const roll = new DiceRoll(diceCount, dieSize, modifier, mode);

      expect(toExpression(roll)).toBe(expected);
    }
  );
});

describe("GlobalDicePattern", () => {
  test("finds dice expressions and loose modifiers in text", () => {
    expect("Hit +7; damage 2d6 + 3 and - 2".match(GlobalDicePattern)).toEqual([
      "+7",
      "2d6 + 3",
      "- 2"
    ]);
  });
});
