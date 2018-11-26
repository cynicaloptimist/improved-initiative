import * as React from "react";
import { Prompt } from "./Prompt";

interface PromptQueueProps {
    prompts: Prompt[];
    resolve: (prompt: Prompt) => (target: EventTarget) => void;
}

interface PromptQueueState { }
export class PromptQueueComponent extends React.Component<PromptQueueProps, PromptQueueState> {
    public render() {
        const components = this.props.prompts.map(this.renderPromptComponent);
        return components;
    }

    private renderPromptComponent = ((prompt: Prompt, index: number) =>
        <form
            key={index}
            className="prompt"
            onSubmit={(event) => {
                this.props.resolve(prompt)(event.target);
                event.preventDefault();
            }} >
            {prompt.component}
        </form>
    );
}