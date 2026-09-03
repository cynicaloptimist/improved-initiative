import { Dice, rollDie } from "./Dice";

describe("rollDie", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns values from one through the die size", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999);

    expect(rollDie(6)).toBe(1);
    expect(rollDie(6)).toBe(6);
  });

  test("is used for regular and loose-modifier expressions", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    expect(Dice.RollDiceExpression("2d6").Rolls).toEqual([1, 1]);
    expect(Dice.RollDiceExpression("+5").Rolls).toEqual([1]);
  });
});
