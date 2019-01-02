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
});
