import * as React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { RenameResult } from "../RenameResult";
import { InlineNameEditor } from "./InlineNameEditor";

function getInput(container: HTMLElement) {
  return container.querySelector("input") as HTMLInputElement;
}

describe("InlineNameEditor", () => {
  test("focuses the input and commits the edited name with Enter", async () => {
    const onCommit = jest.fn().mockResolvedValue({ success: true });
    const rendered = render(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={jest.fn()}
        onCommit={onCommit}
      />
    );

    const input = getInput(rendered.container);
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: "Finale" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onCommit).toHaveBeenCalledWith("Finale"));
  });

  test("discards with Escape or blur", () => {
    const onCancel = jest.fn();
    const rendered = render(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={onCancel}
        onCommit={jest.fn()}
      />
    );

    const input = getInput(rendered.container);
    fireEvent.keyDown(input, {
      key: "Escape"
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    rendered.rerender(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={onCancel}
        onCommit={jest.fn()}
      />
    );
    fireEvent.blur(getInput(rendered.container));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  test("does not duplicate or discard a commit while saving", () => {
    const onCancel = jest.fn();
    const onCommit = jest
      .fn()
      .mockImplementation(() => new Promise<RenameResult>(() => {}));
    const rendered = render(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={onCancel}
        onCommit={onCommit}
      />
    );

    const input = getInput(rendered.container);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test("ignores a failed commit after the editor unmounts", async () => {
    const resolveCommit: {
      current?: (result: RenameResult) => void;
    } = {};
    const onCommit = jest.fn().mockImplementation(
      () =>
        new Promise<RenameResult>(resolve => {
          resolveCommit.current = resolve;
        })
    );
    const rendered = render(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={jest.fn()}
        onCommit={onCommit}
      />
    );

    fireEvent.keyDown(getInput(rendered.container), {
      key: "Enter"
    });
    rendered.unmount();
    await act(async () => {
      resolveCommit.current!({ success: false, error: "Rename error" });
    });

    expect(document.body.textContent).not.toContain("Rename error");
  });

  test("keeps editing and displays rename feedback in a popup", async () => {
    const renameError = "Rename error";
    const onCommit = jest.fn().mockResolvedValue({
      success: false,
      error: renameError
    });
    const rendered = render(
      <InlineNameEditor
        name="Goblin Ambush"
        onCancel={jest.fn()}
        onCommit={onCommit}
      />
    );

    const input = getInput(rendered.container);
    fireEvent.change(input, { target: { value: "Finale" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(document.body.textContent).toContain(renameError)
    );
    expect(
      document.querySelector('.tippy-box[data-theme~="error-message"]')
    ).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Finale");

    fireEvent.change(input, { target: { value: "Finale revised" } });
    await waitFor(() =>
      expect(document.body.textContent).not.toContain(renameError)
    );
  });
});
