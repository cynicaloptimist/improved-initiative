import * as React from "react";

import { Prompt } from "./Prompt";

interface UpdateNotesPromptComponentProps { }

interface UpdateNotesPromptComponentState { }

class UpdateNotesPromptComponent extends React.Component<UpdateNotesPromptComponentProps, UpdateNotesPromptComponentState> {
    public render() {
        return "";
    }
}

export class UpdateNotesPrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "reactprompt";
    public component: JSX.Element;

    constructor() {
        this.component = <UpdateNotesPromptComponent />;
    }

    public Resolve = (form: HTMLFormElement) => {

    }
}