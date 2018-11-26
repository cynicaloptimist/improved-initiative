import * as React from "react";
import { Prompt } from "./Prompt";
import { PromptQueue } from "./PromptQueue";

interface PromptQueueProps {
    promptQueue: PromptQueue;
}

interface PromptQueueState { }
export class PromptQueueComponent extends React.Component<PromptQueueProps, PromptQueueState> {
    public render() {
        const components = this.props.promptQueue.Prompts().map(this.renderPromptComponent);
        return components;
    }

    public componentDidMount() {
        this.promptsSubscription = this.props.promptQueue.Prompts.subscribe(p => this.forceUpdate());
    }

    public componentWillUnmount() {
        this.promptsSubscription.dispose();
    }

    private promptsSubscription: KnockoutSubscription;
    
    private renderPromptComponent = ((prompt: Prompt, index: number) =>
        <form
            key={index}
            className="prompt"
            onSubmit={(event) => {
                this.props.promptQueue.Resolve(prompt)(event.target);
                event.preventDefault();
            }} >
            {prompt.component}
        </form>
    );
}