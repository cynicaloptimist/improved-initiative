import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Combatant } from "../../Combatant/Combatant";
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Field } from "formik";
import { StandardPromptLayout } from "./StandardPromptLayout";

type EditAliasModel = { alias: string };

export function EditAliasPrompt(
  combatant: Combatant,
  onSubmit: (model: EditAliasModel) => boolean
): PromptProps<EditAliasModel> {
  const labelId = probablyUniqueString();

  return {
    autoFocusSelector: ".response",
    children: (
      <StandardPromptLayout
        className="p-edit-alias"
        label={`Change alias for ${combatant.DisplayName()}:`}
      >
        <Field
          name="alias"
          className="response"
          type="text"
          defaultValue={combatant.Alias()}
          id={labelId}
        />
      </StandardPromptLayout>
    ),
    initialValues: {
      alias: combatant.Alias()
    },
    onSubmit
  };
}
