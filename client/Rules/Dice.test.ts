import { DiceRoll, rollDie, RollMode, RollModes } from "./Dice";

describe("rollDie", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns every value from one through the die size", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999999);

    expect([rollDie(4), rollDie(4), rollDie(4), rollDie(4)]).toEqual([
      1, 2, 3, 4
    ]);
  });

  test("returns the minimum and maximum values of a d20", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999);

    expect(rollDie(20)).toBe(1);
    expect(rollDie(20)).toBe(20);
  });
});

function createRoll(
  results: number[],
  modifier: number,
  dieSize: number,
  mode?: RollMode
): DiceRoll {
  const random = jest.spyOn(Math, "random");
  results.forEach(result =>
    random.mockReturnValueOnce((result - 0.5) / dieSize)
  );
  return new DiceRoll(
    mode === undefined ? results.length : 1,
    dieSize,
    modifier,
    mode
  );
}

describe("DiceRoll", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("calculates the total", () => {
    expect(createRoll([3, 6, 7], 4, 12).Total).toBe(20);
  });

  test.each([
    {
      description: "without a modifier",
      results: [3, 4],
      modifier: 0,
      expected: "[3,4] = 7"
    },
    {
      description: "with a positive modifier",
      results: [3, 4],
      modifier: 2,
      expected: "[3,4] + 2 = 9"
    },
    {
      description: "with a negative modifier",
      results: [3, 4],
      modifier: -2,
      expected: "[3,4] - 2 = 5"
    }
  ])(
    "formats the result string $description",
    ({ results, modifier, expected }) => {
      expect(createRoll(results, modifier, 6).ToResultString()).toBe(expected);
    }
  );

  test.each([
    {
      description: "higher first roll with advantage",
      results: [17, 5],
      modifier: 3,
      mode: RollModes.Advantage,
      chosenIndex: 0,
      total: 20
    },
    {
      description: "higher second roll with advantage",
      results: [5, 17],
      modifier: 3,
      mode: RollModes.Advantage,
      chosenIndex: 1,
      total: 20
    },
    {
      description: "lower first roll with disadvantage",
      results: [5, 17],
      modifier: -2,
      mode: RollModes.Disadvantage,
      chosenIndex: 0,
      total: 3
    },
    {
      description: "lower second roll with disadvantage",
      results: [17, 5],
      modifier: -2,
      mode: RollModes.Disadvantage,
      chosenIndex: 1,
      total: 3
    }
  ])(
    "selects the $description",
    ({ results, modifier, mode, chosenIndex, total }) => {
      const roll = createRoll(results, modifier, 20, mode);

      expect(roll.ChosenIndex).toBe(chosenIndex);
      expect(roll.Total).toBe(total);
    }
  );

  test.each([
    { mode: RollModes.Advantage, chosenIndex: 1 },
    { mode: RollModes.Disadvantage, chosenIndex: 0 }
  ])(
    "selects a deterministic roll when tied with $mode",
    ({ mode, chosenIndex }) => {
      const roll = createRoll([10, 10], 0, 20, mode);

      expect(roll.ChosenIndex).toBe(chosenIndex);
      expect(roll.Total).toBe(10);
    }
  );

  test.each([
    {
      description: "an advantage",
      results: [7, 18],
      modifier: 2,
      mode: RollModes.Advantage,
      expected: "[7,18]a + 2 = 20"
    },
    {
      description: "a disadvantage",
      results: [7, 18],
      modifier: -2,
      mode: RollModes.Disadvantage,
      expected: "[7,18]d - 2 = 5"
    }
  ])("formats $description result", ({ results, modifier, mode, expected }) => {
    expect(createRoll(results, modifier, 20, mode).ToResultString()).toBe(
      expected
    );
  });

  test.each([
    { diceCount: 2, dieSize: 20 },
    { diceCount: 1, dieSize: 6 }
  ])(
    "rejects $diceCount d$dieSize rolls with a mode",
    ({ diceCount, dieSize }) => {
      expect(
        () => new DiceRoll(diceCount, dieSize, 0, RollModes.Advantage)
      ).toThrow("A roll mode can only be added to a single d20 roll");
    }
  );

  test.each([
    { diceCount: 1, dieSize: 20, mode: undefined, expected: true },
    { diceCount: 2, dieSize: 20, mode: undefined, expected: false },
    { diceCount: 1, dieSize: 6, mode: undefined, expected: false },
    {
      diceCount: 1,
      dieSize: 20,
      mode: RollModes.Advantage,
      expected: false
    }
  ])(
    "reports whether a mode can be selected for $diceCount d$dieSize in $mode mode",
    ({ diceCount, dieSize, mode, expected }) => {
      jest.spyOn(Math, "random").mockReturnValue(0);

      expect(new DiceRoll(diceCount, dieSize, 0, mode).CanSelectMode()).toBe(
        expected
      );
    }
  );

  test("rerolls using the same dice and mode", () => {
    const random = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.25);
    const initialRoll = new DiceRoll(1, 20, 3, RollModes.Advantage);

    const reroll = initialRoll.Reroll();

    expect(initialRoll.Results).toEqual([1, 20]);
    expect(reroll.Results).toEqual([11, 6]);
    expect(reroll.DiceCount).toBe(1);
    expect(reroll.DieSize).toBe(20);
    expect(reroll.Modifier).toBe(3);
    expect(reroll.Mode).toBe(RollModes.Advantage);
  });

  test.each([RollModes.Advantage, RollModes.Disadvantage])(
    "adds one d20 to an existing roll for %s",
    mode => {
      const random = jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.55)
        .mockReturnValueOnce(0);

      const initialRoll = new DiceRoll(1, 20, 5);
      const modeRoll = initialRoll.WithMode(mode);

      expect(modeRoll.Results).toEqual([12, 1]);
      expect(modeRoll.Modifier).toBe(5);
      expect(modeRoll.DieSize).toBe(20);
      expect(modeRoll.Mode).toBe(mode);
    }
  );
});
