export interface Prompt {
    InputSelector: string;
    ComponentName: string;
    Resolve: (form: HTMLFormElement) => void;
}

export type PromptResolver = (responses: { [id: string]: string }) => void;

export class DefaultPrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "defaultprompt";

    constructor(public Query: string, private resolve: PromptResolver = () => { }) { }

    public Resolve = (form: HTMLFormElement) => {
        const inputs = $(form).find(this.InputSelector);
        const inputsById = {};
        inputs.map((_, element) => {
            if ($(element).prop("checked") && $(element).attr("name")) {
                inputsById[$(element).attr("name")] = $(element).val();
            }
            inputsById[element.id] = $(element).val();
        });
        this.resolve(inputsById);
    }
}
