import * as ko from "knockout";

import { probablyUniqueString } from "../../../common/Toolbox";
import { PromptProps } from "./PendingPrompts";
import { LegacyPrompt } from "./Prompt";

export class PromptQueue {
  constructor() {}

  protected LegacyPrompts = ko.observableArray<LegacyPrompt>();
  private prompts = ko.observableArray<[PromptProps<any>, string]>();

  public Add = (prompt: PromptProps<any>) =>
    this.prompts.push([prompt, probablyUniqueString()]);

  public Remove = (promptId: string) =>
    this.prompts.remove(p => p[1] == promptId);

  public GetPrompts = () => this.prompts();

  public AddLegacyPrompt = (prompt: LegacyPrompt) => {
    this.LegacyPrompts.push(prompt);
  };

  protected ResolveLegacyPrompt = (prompt: LegacyPrompt) => (
    form: HTMLFormElement
  ) => {
    prompt.Resolve(form);
    this.LegacyPrompts.remove(prompt);
    if (this.HasLegacyPrompt()) {
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
    return this.prompts().length > 0 || this.LegacyPrompts().length > 0;
  });

  public HasLegacyPrompt = ko.pureComputed(() => {
    return this.LegacyPrompts().length > 0;
  });

  public Dismiss = () => {
    if (this.HasLegacyPrompt()) {
      this.LegacyPrompts.remove(this.LegacyPrompts()[0]);
    }
  };

  public AnimatePrompt = () => {
    if (!this.HasLegacyPrompt()) {
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
