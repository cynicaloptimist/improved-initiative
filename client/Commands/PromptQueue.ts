import * as ko from "knockout";

import { probablyUniqueString } from "../../common/Toolbox";
import { PromptProps } from "../Prompts/PendingPrompts";

export class PromptQueue {
  constructor() {}

  private prompts = ko.observableArray<[PromptProps<any>, string]>();

  public Add = (prompt: PromptProps<any>) => {
    const promptId = probablyUniqueString();
    this.prompts.push([prompt, promptId]);
    return promptId;
  };

  public Remove = (promptId: string) =>
    this.prompts.remove(p => p[1] == promptId);

  public GetPrompts = () => this.prompts();

  public HasPrompt = ko.pureComputed(() => {
    return this.prompts().length > 0;
  });
}
