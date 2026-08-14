import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

export function LinkInitiativePrompt(
  onDismiss: () => void
): PromptProps<Record<string, never>> {
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
        fieldsDoSubmit
      >
        {null}
      </StandardPromptLayout>
    ),
    autoFocusSelector: ".prompt__close",
    initialValues: {},
    onDismiss,
    onSubmit: () => {
      onDismiss();
      return true;
    }
  };
}
