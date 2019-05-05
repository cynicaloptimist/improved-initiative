import * as ko from "knockout";

import { LegacyPrompt } from "./Prompt";

export class PromptQueue {
  constructor() {}

  protected LegacyPrompts = ko.observableArray<LegacyPrompt>();

  public AddLegacyPrompt = (prompt: LegacyPrompt) => {
    this.Prompts.push(prompt);
  };

  protected ResolveLegacyPrompt = (prompt: LegacyPrompt) => (
    form: HTMLFormElement
  ) => {
    prompt.Resolve(form);
    this.LegacyPrompts.remove(prompt);
    if (this.HasPrompt()) {
      $(this.LegacyPrompts()[0].InputSelector)
        .first()
        .select();
    }
  };

  protected UpdateLegacyDom = (
    element: HTMLFormElement,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) => {
    $(element).keyup(e => {
      if (e.keyCode == 27) {
        this.Dismiss();
      }
    });
    $(element)
      .find(viewModel.InputSelector)
      .last()
      .select();
  };

  public HasPrompt = ko.pureComputed(() => {
    return this.LegacyPrompts().length > 0;
  });

  public Dismiss = () => {
    if (this.HasPrompt()) {
      this.LegacyPrompts.remove(this.LegacyPrompts()[0]);
    }
  };

  public AnimatePrompt = () => {
    if (!this.HasPrompt()) {
      return;
    }
    const opts = { duration: 200 };
    const up = { "margin-bottom": "+=10" };
    const down = { "margin-bottom": "-=10" };
    $(".prompt")
      .animate(up, opts)
      .animate(down, opts)
      .find(this.LegacyPrompts()[0].InputSelector)
      .first()
      .select();
  };
}
