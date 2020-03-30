import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { SubmitButton } from "../../Components/Button";

export function LinkInitiativePrompt(onDismiss: () => void): PromptProps<{}> {
  return {
    children: (
      <div className="p-link-initiative">
        <label className="message">
          Select another combatant to link initiative. <br />
          <em>Tip:</em> You can select multiple combatants with 'ctrl', then use
          this command to link them to one shared initiative count.
        </label>
        <SubmitButton faClass="times" />
      </div>
    ),
    autoFocusSelector: "button",
    initialValues: {},
    onSubmit: () => {
      onDismiss();
      return true;
    }
  };
}
