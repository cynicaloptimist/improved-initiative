import { render } from "@testing-library/react";
import * as React from "react";

import { RollResult } from "../Rules/RollResult";
import { ShowDiceRollResultPrompt } from "./RollDicePrompt";

function RenderRollResult(result: RollResult) {
  const prompt = ShowDiceRollResultPrompt(result, () => result);
  return render(prompt.children as React.ReactElement);
}

function ReadRolls(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".p-roll-dice-result__roll")
  ).map(roll => roll.textContent || "");
}

describe("dice roll result prompt", () => {
  test.each([
    {
      description: "one die without a modifier",
      result: new RollResult([13], 0, 20),
      expression: "Rolled 1d20",
      calculation: "= 13",
      total: "13"
    },
    {
      description: "several dice without a modifier",
      result: new RollResult([2, 5], 0, 6),
      expression: "Rolled 2d6",
      calculation: "= 7",
      total: "7"
    },
    {
      description: "one die with a positive modifier",
      result: new RollResult([4], 2, 8),
      expression: "Rolled 1d8 + 2",
      calculation: "+ 2 = 6",
      total: "6"
    },
    {
      description: "several dice with a negative modifier",
      result: new RollResult([3, 8, 9], -4, 10),
      expression: "Rolled 3d10 - 4",
      calculation: "- 4 = 16",
      total: "16"
    }
  ])("renders $description", ({ result, expression, calculation, total }) => {
    const rendered = RenderRollResult(result);

    expect(rendered.getByText(expression)).toBeTruthy();
    expect(rendered.getByText(calculation)).toBeTruthy();
    expect(
      rendered.container.querySelector(".p-roll-dice-result__total")!
        .textContent
    ).toBe(total);
    expect(ReadRolls(rendered.container)).toEqual(
      result.Rolls.map(value => value.toString())
    );
  });

  test("marks minimum, maximum, and regular rolls", () => {
    const rendered = RenderRollResult(new RollResult([1, 3, 6], 0, 6));
    const rolls = Array.from(
      rendered.container.querySelectorAll<HTMLElement>(
        ".p-roll-dice-result__roll"
      )
    );

    expect(rolls[0].classList.contains("p-roll-dice-result__roll--min")).toBe(
      true
    );
    expect(rolls[0].classList.contains("p-roll-dice-result__roll--max")).toBe(
      false
    );
    expect(rolls[1].classList.contains("p-roll-dice-result__roll--min")).toBe(
      false
    );
    expect(rolls[1].classList.contains("p-roll-dice-result__roll--max")).toBe(
      false
    );
    expect(rolls[2].classList.contains("p-roll-dice-result__roll--min")).toBe(
      false
    );
    expect(rolls[2].classList.contains("p-roll-dice-result__roll--max")).toBe(
      true
    );
  });
});
