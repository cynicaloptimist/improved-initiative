import { fireEvent, render, waitFor, within } from "@testing-library/react";
import * as React from "react";

import { Spell } from "../../common/Spell";
import { Listing } from "../Library/Listing";
import { DiceRoll } from "../Rules/Dice";
import { CombatStatsPrompt } from "./CombatStatsPrompt";
import { ConditionReferencePrompt } from "./ConditionReferencePrompt";
import { LinkInitiativePrompt } from "./LinkInitiativePrompt";
import { PendingPrompts, PromptProps } from "./PendingPrompts";
import { DiceRollResultPrompt } from "./dice/RollResultsPrompt";
import { SpellPrompt } from "./SpellPrompt";

type DismissiblePromptProps = PromptProps<Record<string, never>> & {
  onDismiss?: () => void;
};

function MockPrompt(
  overrides: Partial<DismissiblePromptProps> = {}
): DismissiblePromptProps {
  return {
    autoFocusSelector: ".does-not-exist",
    children: <span>Prompt content</span>,
    initialValues: {},
    onSubmit: jest.fn(() => true),
    ...overrides
  };
}

function RenderPrompts(
  promptsAndIds: [PromptProps<any>, string][],
  removePrompt = jest.fn()
) {
  return {
    ...render(
      <PendingPrompts
        promptsAndIds={promptsAndIds}
        removePrompt={removePrompt}
      />
    ),
    removePrompt
  };
}

function ReadDiceResult(prompt: HTMLFormElement) {
  return {
    expression: within(prompt).getByText(/^Rolled /).textContent,
    rolls: Array.from(
      prompt.querySelectorAll<HTMLElement>(".p-roll-dice-result__roll")
    ).map(roll => roll.textContent),
    calculation: prompt.querySelector<HTMLElement>(
      ".p-roll-dice-result__calculation"
    )!.textContent,
    total: prompt.querySelector<HTMLElement>(".p-roll-dice-result__total")!
      .textContent
  };
}

describe("PendingPrompts", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("adds the prompt-specific class name to the prompt form", () => {
    const rendered = RenderPrompts([
      [MockPrompt({ className: "prompt--custom" }), "custom-prompt"]
    ]);

    const promptForm = rendered.container.querySelector("form")!;

    expect(promptForm.classList.contains("prompt")).toBe(true);
    expect(promptForm.classList.contains("prompt--custom")).toBe(true);
  });

  test("adds several prompt-specific class names to the prompt form", () => {
    const rendered = RenderPrompts([
      [
        MockPrompt({ className: "prompt--custom prompt--custom-2" }),
        "custom-prompt"
      ]
    ]);

    const promptForm = rendered.container.querySelector("form")!;

    expect(promptForm.classList.contains("prompt")).toBe(true);
    expect(promptForm.classList.contains("prompt--custom")).toBe(true);
    expect(promptForm.classList.contains("prompt--custom-2")).toBe(true);
  });

  test("works without prompt-specific class names", () => {
    const rendered = RenderPrompts([[MockPrompt(), "custom-prompt"]]);

    const promptForm = rendered.container.querySelector("form")!;

    expect(promptForm.classList.contains("prompt")).toBe(true);
  });

  test("closes one prompt without submitting it", () => {
    const prompt = MockPrompt();
    const rendered = RenderPrompts([[prompt, "first-prompt"]]);
    const closeButton = rendered.getByRole("button", { name: "Close" });

    expect(closeButton.getAttribute("type")).toBe("button");
    expect(rendered.queryByRole("button", { name: "Close all" })).toBeNull();

    fireEvent.click(closeButton);

    expect(rendered.removePrompt).toHaveBeenCalledWith("first-prompt");
    expect(prompt.onSubmit).not.toHaveBeenCalled();
  });

  test("shows Close all only on the first prompt when several are open", () => {
    const rendered = RenderPrompts([
      [MockPrompt(), "first-prompt"],
      [MockPrompt(), "second-prompt"]
    ]);
    const promptForms =
      rendered.container.querySelectorAll<HTMLFormElement>("form.prompt");

    expect(
      within(promptForms[0]).getByRole("button", { name: "Close all" })
    ).toBeTruthy();
    expect(
      within(promptForms[1]).queryByRole("button", { name: "Close all" })
    ).toBeNull();
    expect(rendered.getAllByRole("button", { name: "Close all" })).toHaveLength(
      1
    );
  });

  test("closes the current prompt snapshot without submitting any prompt", () => {
    const promptsAndIds: [DismissiblePromptProps, string][] = [];
    const firstPrompt = MockPrompt({
      onDismiss: () => promptsAndIds.splice(1, 1)
    });
    const secondPrompt = MockPrompt();
    promptsAndIds.push(
      [firstPrompt, "first-prompt"],
      [secondPrompt, "second-prompt"]
    );
    const rendered = RenderPrompts(promptsAndIds);

    fireEvent.click(rendered.getByRole("button", { name: "Close all" }));

    expect(rendered.removePrompt.mock.calls).toEqual([
      ["first-prompt"],
      ["second-prompt"]
    ]);
    expect(firstPrompt.onSubmit).not.toHaveBeenCalled();
    expect(secondPrompt.onSubmit).not.toHaveBeenCalled();
  });

  test("uses the same dismissal callback for Close and Escape", () => {
    const closeDismiss = jest.fn();
    const escapeDismiss = jest.fn();
    const rendered = RenderPrompts([
      [MockPrompt({ onDismiss: closeDismiss }), "close-prompt"],
      [MockPrompt({ onDismiss: escapeDismiss }), "escape-prompt"]
    ]);
    const promptForms =
      rendered.container.querySelectorAll<HTMLFormElement>("form.prompt");

    fireEvent.click(
      within(promptForms[0]).getByRole("button", { name: "Close" })
    );
    fireEvent.keyUp(promptForms[1], { key: "Escape" });

    expect(closeDismiss).toHaveBeenCalledTimes(1);
    expect(escapeDismiss).toHaveBeenCalledTimes(1);
    expect(rendered.removePrompt.mock.calls).toEqual([
      ["close-prompt"],
      ["escape-prompt"]
    ]);
  });

  test("removes Close all when only one prompt remains", () => {
    const firstPrompt = MockPrompt();
    const secondPrompt = MockPrompt();
    const rendered = RenderPrompts([
      [firstPrompt, "first-prompt"],
      [secondPrompt, "second-prompt"]
    ]);

    rendered.rerender(
      <PendingPrompts
        promptsAndIds={[[firstPrompt, "first-prompt"]]}
        removePrompt={rendered.removePrompt}
      />
    );

    expect(rendered.queryByRole("button", { name: "Close all" })).toBeNull();
  });

  test("informational prompts rely on the shared Close control", () => {
    const spell = { ...Spell.Default(), Name: "Fireball" };
    const spellListing = new Listing<Spell>(
      {
        Id: spell.Id,
        Link: "",
        Name: spell.Name,
        SearchHint: "",
        FilterDimensions: {},
        Path: "",
        LastUpdateMs: 0
      },
      "localStorage",
      spell
    );
    const rendered = RenderPrompts([
      [
        CombatStatsPrompt({
          combatants: [],
          elapsedRounds: 1,
          elapsedSeconds: 1
        }),
        "combat-stats"
      ],
      [ConditionReferencePrompt("Prone")!, "condition-reference"],
      [SpellPrompt(spellListing), "spell-reference"]
    ]);

    expect(
      rendered.container.querySelectorAll("button[type='submit']")
    ).toHaveLength(0);
    expect(rendered.getAllByRole("button", { name: "Close" })).toHaveLength(3);
  });

  test("rerolls only the selected dice result prompt", () => {
    const random = jest.spyOn(Math, "random");
    const queueResult = (result: number, dieSize: number) =>
      random.mockReturnValueOnce((result - 0.5) / dieSize);

    queueResult(2, 6);
    queueResult(2, 8);
    queueResult(3, 8);
    queueResult(4, 10);
    queueResult(5, 10);
    queueResult(6, 10);
    queueResult(7, 8);
    queueResult(8, 8);

    const rendered = RenderPrompts([
      [
        DiceRollResultPrompt(new DiceRoll(1, 6, 0), jest.fn()),
        "first-dice-result"
      ],
      [
        DiceRollResultPrompt(new DiceRoll(2, 8, 1), jest.fn()),
        "second-dice-result"
      ],
      [
        DiceRollResultPrompt(new DiceRoll(3, 10, -2), jest.fn()),
        "third-dice-result"
      ]
    ]);
    const promptForms = Array.from(
      rendered.container.querySelectorAll<HTMLFormElement>("form.prompt")
    );
    const before = promptForms.map(ReadDiceResult);

    fireEvent.click(
      within(promptForms[1]).getByRole("button", { name: "Reroll" })
    );

    const rerolledPromptForms = Array.from(
      rendered.container.querySelectorAll<HTMLFormElement>("form.prompt")
    );
    const after = rerolledPromptForms.map(ReadDiceResult);

    expect(after[0]).toEqual(before[0]);
    expect(after[1]).toEqual({
      expression: "Rolled 2d8 + 1",
      rolls: ["7", "8"],
      calculation: "+ 1 = 16",
      total: "16"
    });
    expect(after[2]).toEqual(before[2]);
  });

  test("clears Link Initiative state through the shared Close control", () => {
    const clearPendingLink = jest.fn();
    const prompt = LinkInitiativePrompt(clearPendingLink);
    const rendered = RenderPrompts([[prompt, "link-prompt"]]);

    fireEvent.click(rendered.getByRole("button", { name: "Close" }));

    expect(clearPendingLink).toHaveBeenCalledTimes(1);
    expect(rendered.removePrompt).toHaveBeenCalledWith("link-prompt");
  });

  test("clears Link Initiative state when the prompt is submitted", async () => {
    const clearPendingLink = jest.fn();
    const prompt = LinkInitiativePrompt(clearPendingLink);
    const rendered = RenderPrompts([[prompt, "link-prompt"]]);

    fireEvent.submit(
      rendered.container.querySelector<HTMLFormElement>("form")!
    );

    await waitFor(() => {
      expect(clearPendingLink).toHaveBeenCalledTimes(1);
      expect(rendered.removePrompt).toHaveBeenCalledWith("link-prompt");
    });
  });
});
