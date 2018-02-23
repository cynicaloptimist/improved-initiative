import * as _ from "lodash";
import * as React from "react";
import { StatBlock } from "../../StatBlock/StatBlock";
import { Prompt } from "./Prompt";

const promptClassName = "p-quick-add";
const inputClassName = promptClassName + "-input";
const nameInputId = promptClassName + "-name";

interface QuickAddPromptProps { }
interface QuickAddPromptState { }
class QuickAddPrompt extends React.Component<QuickAddPromptProps, QuickAddPromptState> {
    private focusInput: HTMLInputElement;
    public componentDidMount() {
        this.focusInput.focus();
    }

    public render() {
        return <div className={promptClassName}>
            <input ref={i => this.focusInput = i} id={nameInputId} className={inputClassName} type="text" placeholder="Name..." />
            <button type="submit" className="fa fa-check button"></button>
        </div>;
    }
}

export class QuickAddPromptWrapper implements Prompt {
    private dequeueCallback: any;
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    constructor(private addStatBlock: (statBlock: StatBlock) => void) {

    }

    public Resolve = (form: HTMLFormElement) => {
        const nameElement = $(form).find("#" + nameInputId);
        const statBlock = { ...StatBlock.Default(), Name: nameElement.val().toString() };
        this.addStatBlock(statBlock);
        this.dequeueCallback();
    }

    public SetDequeueCallback = callback => this.dequeueCallback = callback;

    private component = <QuickAddPrompt />;
}