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
});
