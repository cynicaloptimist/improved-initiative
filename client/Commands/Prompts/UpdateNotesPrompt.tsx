import * as React from "react";

import { Combatant } from "../../Combatant/Combatant";
import { SubmitButton } from "../../Components/Button";
import { Metrics } from "../../Utility/Metrics";
import { LegacyPrompt } from "./Prompt";

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
        <SubmitButton />
      </div>
    );
  }
}

export class UpdateNotesPrompt implements LegacyPrompt {
  public InputSelector = ".p-update-notes__notes";
  public ComponentName = "reactprompt";
  public component: JSX.Element;

  constructor(private combatant: Combatant) {
    this.component = (
      <UpdateNotesPromptComponent
        currentNotes={this.combatant.CurrentNotes()}
      />
    );
  }

  public Resolve = (form: HTMLFormElement) => {
    const input = form.getElementsByClassName(
      "p-update-notes__notes"
    )[0] as HTMLTextAreaElement;
    this.combatant.CurrentNotes(input.value);
    Metrics.TrackEvent("NotesUpdated", {
      Name: this.combatant.DisplayName(),
      Notes: input.value.substr(0, 100)
    });
  };
}
