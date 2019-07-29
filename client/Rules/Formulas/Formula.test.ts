// import { DefaultRules, IRules } from "./Rules";
import { text } from "body-parser";
import { StatBlock } from "../../../common/StatBlock";
import { DefaultRules } from "../Rules";
import { AbilityReference } from "./AbilityReference";
import { Die } from "./Die";
import { Formula, ReferenceFreeFormula } from "./Formula";
import { FormulaTerm } from "./FormulaTerm";
import { StatReference } from "./StatReference";

describe("Formula", () => {
  let term: FormulaTerm;
  let stats: StatBlock;
  let rules = new DefaultRules();
  let testCounter = 1;
  let OriginalRandom = Math.random;

  beforeEach(() => {
    // console.log(`Starting test ${testCounter++}`);
    stats = StatBlock.Default();
    stats.Abilities.Dex = 16;
    stats.ProficiencyBonus = 2;
  });

  test("Die roll", () => {
    term = new Die("2d6");
    Math.random = jest
      .fn()
      .mockReturnValueOnce(5 / 6)
      .mockReturnValueOnce(3 / 6);
    expect(term.Evaluate().Total).toBe(8);
  });

  test("Extract dexterity", () => {
    term = new AbilityReference("[DEX]", rules);
    expect(term.Evaluate(stats).Total).toBe(3);
    expect(term.FormulaString()).toBe("Dex");
  });

  test("Extract proficiency bonus", () => {
    term = new StatReference("[PROF]", rules);
    expect(term.Evaluate(stats).Total).toBe(2);
    expect(term.FormulaString()).toBe("ProficiencyBonus");
  });

  test("Build formula", () => {
    term = new Formula("1d6 + [DEX] + [PROF] - 5", rules);
    expect(term.FormulaString()).toBe("1d6+Dex+ProficiencyBonus-5");
  });

  test("Evaluate formula", () => {
    term = new Formula("1d6 + [DEX] + [PROF] - 5", rules);
    Math.random = jest.fn().mockReturnValueOnce(5 / 6);
    expect(term.Evaluate(stats).Total).toBe(5 + 3 + 2 - 5);
  });

  test("Requiring stats", () => {
    term = new Formula("1d6 + [DEX] + [PROF] - 5", rules);
    expect(term.RequiresStats).toBe(true);
    expect(() => term.Evaluate()).toThrow();
  });

  test("Static evaluation", () => {
    term = new Formula("[DEX] + [PROF] - 5", rules);
    expect(term.HasStaticResult).toBe(true);
    expect(term.EvaluateStatic(stats).Total).toBe(3 + 2 - 5);
  });

  test("Roll check (implied d20)", () => {
    let formula = new Formula("[DEX] + [PROF] - 5", rules);
    Math.random = jest.fn().mockReturnValueOnce(15 / 20);
    expect(formula.RollCheck(stats).Total).toBe(15 + 3 + 2 - 5);
  });

  test("Restricted formulas", () => {
    Math.random = jest.fn().mockReturnValueOnce(5 / 6);
    term = new ReferenceFreeFormula("1d6 - 1");
    expect(term.Evaluate().Total).toBe(5 - 1);

    expect(() => {
      const badFormula = new ReferenceFreeFormula("[DEX] + [PROF]");
    }).toThrow();
  });
});
