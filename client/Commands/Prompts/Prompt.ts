export interface LegacyPrompt {
  InputSelector: string;
  ComponentName: string;
  Resolve: (form: HTMLFormElement) => void;
}

export type LegacyPromptResolver = (responses: {
  [id: string]: string;
}) => void;

export class DefaultPrompt implements LegacyPrompt {
  public InputSelector = ".response";
  public ComponentName = "defaultprompt";

  constructor(
    public Query: string,
    private resolve: LegacyPromptResolver = () => {}
  ) {}

  public Resolve = (form: HTMLFormElement) => {
    const inputs = $(form).find(this.InputSelector);
    const inputsById = {};
    inputs.map((_, element) => {
      const elementName = $(element).attr("name");
      if ($(element).prop("checked") && elementName) {
        inputsById[elementName] = $(element).val();
      }
      inputsById[element.id] = $(element).val();
    });
    this.resolve(inputsById);
  };
}
