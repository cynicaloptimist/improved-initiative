import * as React from "react";
import { Prompt } from "./Prompt";

interface QuickAddPromptProps {}
interface QuickAddPromptState {}
class QuickAddPrompt extends React.Component<QuickAddPromptProps, QuickAddPromptState> {
    public render() {
        return <React.Fragment>QuickAddPrompt</React.Fragment>;
    }
}

export class QuickAddPromptWrapper implements Prompt {
    private dequeueCallback: any;
    public InputSelector = ".name";
    public ComponentName = "reactprompt";
    public Resolve = (form: HTMLFormElement) => { 

    }
    
    public SetDequeueCallback = callback => this.dequeueCallback = callback;
    
    private component = <QuickAddPrompt />;
}