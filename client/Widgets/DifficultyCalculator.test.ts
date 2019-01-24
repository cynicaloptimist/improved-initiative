import { DifficultyCalculator } from "./DifficultyCalculator";

describe("Encounter Difficulty Calculator", () => {
  it("1 CR 1, no Players", () => {
    const difficulty = DifficultyCalculator.Calculate(["1"], []);
    expect(difficulty.Difficulty).toBe("");
    expect(difficulty.EarnedExperience).toBe(200);
    expect(difficulty.EffectiveExperience).toBe(200);
  });
});
