export interface Prompt {
    InputSelector: string;
    ComponentName: string;
    Resolve: (form: HTMLFormElement) => void;
    SetDequeueCallback: (callback: () => void) => void;
}

type PromptResolver = (responses: { [id: string]: string }) => void;

export class DefaultPrompt implements Prompt {
    private dequeue = () => { };
    public InputSelector = ".response";
    public ComponentName = "defaultprompt";
    public SetDequeueCallback = callback => this.dequeue = callback;

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
        this.dequeue();
    }
}
