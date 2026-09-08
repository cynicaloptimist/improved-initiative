import { DefaultRules, IRules } from "./Rules";

describe("DefaultRules", () => {
  let rules: IRules;

  beforeEach(() => {
    rules = new DefaultRules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Ability Score 0", () => {
    expect(rules.GetModifierFromScore(0)).toBe(-5);
  });

  test("Ability Score 10", () => {
    expect(rules.GetModifierFromScore(10)).toBe(0);
  });

  test("Ability Score 18", () => {
    expect(rules.GetModifierFromScore(18)).toBe(4);
  });

  test("Roll with advantage", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(4 / 20)
      .mockReturnValueOnce(14 / 20);
    const roll = rules.AbilityCheck(0, "advantage");
    expect(roll).toEqual({ rolls: [5, 15], finalValue: 15 });
  });

  test("Roll with disadvantage", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(4 / 20)
      .mockReturnValueOnce(14 / 20);
    const roll = rules.AbilityCheck(0, "disadvantage");
    expect(roll).toEqual({ rolls: [5, 15], finalValue: 5 });
  });

  test("Roll with take ten", () => {
    jest.spyOn(Math, "random");
    const roll = rules.AbilityCheck(0, "take-ten");
    expect(roll).toEqual({ rolls: [], finalValue: 10 });
    expect(Math.random).not.toHaveBeenCalled();
  });

  test("Roll the minimum d20 value when Math.random returns zero", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    const roll = rules.AbilityCheck();

    expect(roll).toEqual({ rolls: [1], finalValue: 1 });
  });
});
