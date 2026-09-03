import { RollResult } from "./RollResult";

describe("RollResult", () => {
  let roll: RollResult;

  beforeEach(() => {
    roll = new RollResult([3, 6, 7], 4, 12);
  });

  test("Total", () => {
    expect(roll.Total).toBe(20);
  });

  test("Maximum", () => {
    expect(roll.Maximum).toBe(40);
  });

  test.each([
    {
      description: "without a modifier",
      roll: new RollResult([3, 4], 0, 6),
      expected: "[3,4] = 7"
    },
    {
      description: "with a positive modifier",
      roll: new RollResult([3, 4], 2, 6),
      expected: "[3,4] + 2 = 9"
    },
    {
      description: "with a negative modifier",
      roll: new RollResult([3, 4], -2, 6),
      expected: "[3,4] - 2 = 5"
    }
  ])("formats the result string $description", ({ roll, expected }) => {
    expect(roll.ResultString).toBe(expected);
  });
});
