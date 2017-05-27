import { registerComponent } from "../../Utility/Components";

export interface Prompt {
    InputSelector: string;
    ComponentName: string;
    Resolve: (form: HTMLFormElement) => void;
    SetDequeueCallback: (callback: () => void) => void;
}

export class DefaultPrompt implements Prompt {
    private dequeue = () => { };
    InputSelector = ".response";
    ComponentName = "defaultprompt";
    SetDequeueCallback = callback => this.dequeue = callback;

    constructor(public Query: string, private resolve: (responses: { [id: string]: string }) => void) { }

    Resolve = (form: HTMLFormElement) => {
        const inputs = $(form).find(this.InputSelector);
        const inputsById = {};
        inputs.map((_, element) => {
            inputsById[element.id] = $(element).val();
        });
        this.resolve(inputsById);
        this.dequeue();
    }
}

registerComponent('defaultprompt', params => params.prompt);
