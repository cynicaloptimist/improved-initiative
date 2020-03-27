import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Combatant } from "../../Combatant/Combatant";
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Field } from "formik";

type EditAliasModel = { alias: string };

export function EditAliasPrompt(
  combatant: Combatant,
  onSubmit: (model: EditAliasModel) => boolean
): PromptProps<EditAliasModel> {
  const labelId = probablyUniqueString();

  return {
    autoFocusSelector: ".response",
    children: (
      <span className="p-edit-alias">
        <label className="message" htmlFor={labelId}>
          Change alias for {combatant.DisplayName()}:
        </label>
        <Field
          name="alias"
          className="response"
          type="text"
          defaultValue={combatant.Alias()}
          id={labelId}
        />
        <SubmitButton />
      </span>
    ),
    initialValues: {
      alias: combatant.Alias()
    },
    onSubmit
  };
}
