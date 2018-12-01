import * as React from "react";

import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { PersistentCharacterLibrary } from "../../Library/PersistentCharacterLibrary";
import { Prompt } from "./Prompt";

interface UpdateNotesPromptComponentProps {
    currentNotes: string;
 }

interface UpdateNotesPromptComponentState { }

class UpdateNotesPromptComponent extends React.Component<UpdateNotesPromptComponentProps, UpdateNotesPromptComponentState> {
    public render() {
        return <React.Fragment>
            <textarea className="response" defaultValue={this.props.currentNotes} placeholder="Track long term resources and conditions" />
            <button type="submit" className="fas fa-check button"></button>
        </React.Fragment> ;
    }
}

export class UpdateNotesPrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "reactprompt";
    public component: JSX.Element;

    constructor(private persistentCharacter: PersistentCharacter, private library: PersistentCharacterLibrary) {
        this.component = <UpdateNotesPromptComponent currentNotes={persistentCharacter.Notes} />;
    }

    public Resolve = (form: HTMLFormElement) => {
        const input = form.getElementsByClassName("response")[0] as HTMLTextAreaElement;
        this.library.UpdatePersistentCharacter(this.persistentCharacter.Id, {
            Notes: input.value
        });
    }
}