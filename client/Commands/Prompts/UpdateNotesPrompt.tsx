import * as React from "react";

import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { Combatant } from "../../Combatant/Combatant";
import { PersistentCharacterLibrary } from "../../Library/PersistentCharacterLibrary";
import { Prompt } from "./Prompt";

interface UpdateNotesPromptComponentProps {
  currentNotes: string;
}

interface UpdateNotesPromptComponentState {}

class UpdateNotesPromptComponent extends React.Component<
  UpdateNotesPromptComponentProps,
  UpdateNotesPromptComponentState
> {
  public render() {
    return (
      <div className="p-update-notes">
        <textarea
          className="p-update-notes__notes"
          defaultValue={this.props.currentNotes}
          placeholder="Track long term resources and conditions. *Markdown* is supported."
        />
        <button type="submit" className="fas fa-check button" />
      </div>
    );
  }
}

export class UpdateNotesPrompt implements Prompt {
  public InputSelector = ".p-update-notes__notes";
  public ComponentName = "reactprompt";
  public component: JSX.Element;

  constructor(
    private combatant: Combatant,
    private persistentCharacter: PersistentCharacter,
    private library: PersistentCharacterLibrary
  ) {
    this.component = (
      <UpdateNotesPromptComponent currentNotes={persistentCharacter.Notes} />
    );
  }

  public Resolve = (form: HTMLFormElement) => {
    const input = form.getElementsByClassName(
      "p-update-notes__notes"
    )[0] as HTMLTextAreaElement;
    this.library.UpdatePersistentCharacter(this.persistentCharacter.Id, {
      Notes: input.value
    });
    this.combatant.CurrentNotes(input.value);
  };
}
