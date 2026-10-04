import { fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";

import { PendingPrompts } from "../PendingPrompts";
import { RollDicePrompt } from "./RollDicePrompt";

function RenderRollDicePrompt(
  rollDiceExpression = jest.fn(),
  removePrompt = jest.fn()
) {
  const prompt = RollDicePrompt(rollDiceExpression);
  return {
    ...render(
      <PendingPrompts
        promptsAndIds={[[prompt, "roll-dice"]]}
        removePrompt={removePrompt}
      />
    ),
    rollDiceExpression,
    removePrompt
  };
}

describe("RollDicePrompt", () => {
  test("rolls a d20 when the expression is blank", async () => {
    const rendered = RenderRollDicePrompt();

    fireEvent.submit(rendered.container.querySelector("form")!);

    await waitFor(() => {
      expect(rendered.rollDiceExpression).toHaveBeenCalledWith("1d20");
      expect(rendered.removePrompt).toHaveBeenCalledWith("roll-dice");
    });
  });

  test("submits a valid expression", async () => {
    const rendered = RenderRollDicePrompt();
    fireEvent.change(rendered.getByPlaceholderText("1d20"), {
      target: { value: "2d6 + 3" }
    });

    fireEvent.click(
      rendered.container.querySelector<HTMLButtonElement>(
        "button[type='submit']"
      )!
    );

    await waitFor(() => {
      expect(rendered.rollDiceExpression).toHaveBeenCalledWith("2d6 + 3");
      expect(rendered.removePrompt).toHaveBeenCalledWith("roll-dice");
    });
  });

  test("shows an error and does not submit an invalid expression", async () => {
    const rendered = RenderRollDicePrompt();
    fireEvent.change(rendered.getByPlaceholderText("1d20"), {
      target: { value: "not a dice expr" }
    });

    fireEvent.submit(rendered.container.querySelector("form")!);

    expect(await rendered.findByText("Invalid expression")).toBeTruthy();
    expect(rendered.rollDiceExpression).not.toHaveBeenCalled();
    expect(rendered.removePrompt).not.toHaveBeenCalled();
  });

  test("submits after an invalid expression is corrected", async () => {
    const rendered = RenderRollDicePrompt();
    const input = rendered.getByPlaceholderText("1d20");
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.submit(rendered.container.querySelector("form")!);
    expect(await rendered.findByText("Invalid expression")).toBeTruthy();

    fireEvent.change(input, { target: { value: "+5" } });
    fireEvent.submit(rendered.container.querySelector("form")!);

    await waitFor(() => {
      expect(rendered.rollDiceExpression).toHaveBeenCalledWith("+5");
      expect(rendered.removePrompt).toHaveBeenCalledWith("roll-dice");
    });
  });
});
