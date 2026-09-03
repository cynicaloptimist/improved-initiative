import { rollDie } from "./Dice";

describe("rollDie", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns values from one through the die size", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.75);

    expect([rollDie(4), rollDie(4), rollDie(4), rollDie(4)]).toEqual([
      1, 2, 3, 4
    ]);
  });

  test("returns the minimum and maximum d20 values", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999);

    expect(rollDie(20)).toBe(1);
    expect(rollDie(20)).toBe(20);
  });
});
