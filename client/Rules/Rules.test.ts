import { DefaultRules, IRules } from "./Rules";

describe("DefaultRules", () => {
  let rules: IRules;

  beforeEach(() => {
    rules = new DefaultRules();
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
    Math.random = jest
      .fn()
      .mockReturnValueOnce(5 / 20)
      .mockReturnValueOnce(15 / 20);
    const roll = rules.AbilityCheck(0, "advantage");
    expect(roll).toEqual(15);
  });

  test("Roll with disadvantage", () => {
    Math.random = jest
      .fn()
      .mockReturnValueOnce(5 / 20)
      .mockReturnValueOnce(15 / 20);
    const roll = rules.AbilityCheck(0, "disadvantage");
    expect(roll).toEqual(5);
  });

  test("Roll with take ten", () => {
    Math.random = jest
      .fn()
      .mockReturnValueOnce(5 / 20)
      .mockReturnValueOnce(15 / 20);
    const roll = rules.AbilityCheck(0, "take-ten");
    expect(roll).toEqual(10);
  });
});
