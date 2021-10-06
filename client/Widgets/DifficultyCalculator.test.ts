import { DifficultyCalculator } from "./DifficultyCalculator";

describe("Encounter Difficulty Calculator", () => {
  it("1 CR 1, no Players", () => {
    const difficulty = DifficultyCalculator.Calculate(["1"], []);
    expect(difficulty.Difficulty).toBe("");
    expect(difficulty.EarnedExperience).toBe(200);
    expect(difficulty.EffectiveExperience).toBe(200);
  });

  it("11 CR, 6 Players", () => {
    const difficulty = DifficultyCalculator.Calculate(
      ["11"],
      ["5", "5", "4", "4", "4", "4"]
    );
    expect(difficulty.Difficulty).toBe("Hard");
    expect(difficulty.EarnedExperience).toBe(7200);
    expect(difficulty.EffectiveExperience).toBe(3600);
  });

  it("4 CR 0, no Players", () => {
    const difficulty = DifficultyCalculator.Calculate(["0", "0", "0", "0"], []);
    expect(difficulty.Difficulty).toBe("");
    expect(difficulty.EarnedExperience).toBe(40);
    expect(difficulty.EffectiveExperience).toBe(40);
  });
});
