import * as React from "react";

import { Field } from "formik";
import { Combatant } from "../../Combatant/Combatant";
import { SubmitButton } from "../../Components/Button";
import { Metrics } from "../../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";

function UpdateNotesPromptComponent() {
  return (
    <div className="p-update-notes">
      <Field
        name="Notes"
        className="p-update-notes__notes"
        component="textarea"
        placeholder="Track notes, resources, spell slots, etc. **Markdown** and Counters (e.g. [5/5]) are supported."
      />
      <SubmitButton />
    </div>
  );
}

interface NotesModel {
  Notes: string;
}

export function UpdateNotesPrompt(
  combatant: Combatant
): PromptProps<NotesModel> {
  return {
    autoFocusSelector: ".p-update-notes__notes",
    initialValues: { Notes: combatant.CurrentNotes() },
    onSubmit: (model: NotesModel) => {
      combatant.CurrentNotes(model.Notes);
      Metrics.TrackEvent("NotesUpdated", {
        Name: combatant.DisplayName(),
        Notes: model.Notes.substr(0, 100)
      });
      return true;
    },
    children: <UpdateNotesPromptComponent />
  };
}
