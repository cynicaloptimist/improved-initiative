import * as React from "react";
import { StatBlock } from "../../StatBlock/StatBlock";
import { Prompt } from "./Prompt";

const promptClassName = "p-quick-add";
const inputClassName = promptClassName + "-input";

interface QuickAddPromptProps { }
interface QuickAddPromptState { }
class QuickAddPrompt extends React.Component<QuickAddPromptProps, QuickAddPromptState> {
    private focusInput: HTMLInputElement;
    public componentDidMount() {
        this.focusInput.focus();
    }

    public render() {
        return <div className={promptClassName}>
            Quick Add Combatant
            <input ref={i => this.focusInput = i} name="name" className={inputClassName} type="text" placeholder="Name" />
            <input className={inputClassName} name="hp" type="number" placeholder="HP" />
            <input className={inputClassName} name="ac" type="number" placeholder="AC" />
            <input className={inputClassName} name="initiative" type="number" placeholder="Init" />
            <button type="submit" className="fa fa-check button"></button>
        </div>;
    }
}

export class QuickAddPromptWrapper implements Prompt {
    private dequeueCallback: any;
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    constructor(private addStatBlock: (statBlock: StatBlock) => void) { }

    public Resolve = (form: HTMLFormElement) => {
        const name = $(form).find("[name='name']").val().toString() || "New Combatant";
        const maxHP = parseInt($(form).find("[name='hp']").val().toString()) || 1;
        const ac = parseInt($(form).find("[name='ac']").val().toString()) || 10;
        const initiative = parseInt($(form).find("[name='initiative']").val().toString()) || 0;

        const statBlock: StatBlock = {
            ...StatBlock.Default(),
            Name: name,
            HP: { Value: maxHP, Notes: "" },
            AC: { Value: ac, Notes: "" },
            InitiativeModifier: initiative,
        };

        this.addStatBlock(statBlock);
        this.dequeueCallback();
    }

    public SetDequeueCallback = callback => this.dequeueCallback = callback;

    private component = <QuickAddPrompt />;
}