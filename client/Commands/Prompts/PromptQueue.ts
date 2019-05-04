import * as ko from "knockout";

import { LegacyPrompt } from "./Prompt";

export class PromptQueue {
  constructor() {}

  public Prompts = ko.observableArray<LegacyPrompt>();

  public AddLegacyPrompt = (prompt: LegacyPrompt) => {
    this.Prompts.push(prompt);
  };

  public Resolve = (prompt: LegacyPrompt) => (form: HTMLFormElement) => {
    prompt.Resolve(form);
    this.Prompts.remove(prompt);
    if (this.HasPrompt()) {
      $(this.Prompts()[0].InputSelector)
        .first()
        .select();
    }
  };

  public UpdateDom = (
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
    return this.Prompts().length > 0;
  });

  public Dismiss = () => {
    if (this.HasPrompt()) {
      this.Prompts.remove(this.Prompts()[0]);
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
      .find(this.Prompts()[0].InputSelector)
      .first()
      .select();
  };
}
