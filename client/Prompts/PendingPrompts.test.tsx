import { fireEvent, render, waitFor, within } from "@testing-library/react";
import * as React from "react";

import { LinkInitiativePrompt } from "./LinkInitiativePrompt";
import { PendingPrompts, PromptProps } from "./PendingPrompts";

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

describe("PendingPrompts", () => {
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

  test("shows Close all on every prompt when several are open", () => {
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
      within(promptForms[1]).getByRole("button", { name: "Close all" })
    ).toBeTruthy();
    expect(rendered.getAllByRole("button", { name: "Close all" })).toHaveLength(
      2
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

    fireEvent.click(rendered.getAllByRole("button", { name: "Close all" })[0]);

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
