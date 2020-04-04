import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { SubmitButton } from "../Components/Button";
import { StandardPromptLayout } from "./StandardPromptLayout";

export function LinkInitiativePrompt(onDismiss: () => void): PromptProps<{}> {
  return {
    children: (
      <StandardPromptLayout
        className="p-link-initiative"
        label={
          <p>
            Select another combatant to link initiative. <br />
            <em>Tip:</em> You can select multiple combatants with 'ctrl', then
            use this command to link them to one shared initiative count.
          </p>
        }
        noSubmit
      >
        <SubmitButton faClass="times" />
      </StandardPromptLayout>
    ),
    autoFocusSelector: "button",
    initialValues: {},
    onSubmit: () => {
      onDismiss();
      return true;
    }
  };
}
