import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Combatant } from "../Combatant/Combatant";
import {
  toModifierString,
  probablyUniqueString
} from "../../common/Toolbox";
import { SubmitButton } from "../Components/Button";
import { Field } from "formik";
import { StandardPromptLayout } from "./StandardPromptLayout";

type EditInitiativeModel = { initiativeRoll: number; breakLink: boolean };

export function EditInitiativePrompt(
  combatant: Combatant,
  onSubmit: (model: EditInitiativeModel) => boolean
): PromptProps<EditInitiativeModel> {
  const currentInitiative = combatant.Initiative();
  const modifier = toModifierString(combatant.InitiativeBonus());
  const preRoll = currentInitiative || combatant.GetInitiativeRoll();
  const initiativeLabelId = probablyUniqueString();
  const breakLinkLabelId = probablyUniqueString();

  const breakLinkCheckbox = combatant.InitiativeGroup() && (
    <>
      <label htmlFor={breakLinkLabelId}>Break Link: </label>
      <Field
        name="breakLink"
        type="checkbox"
        value="break"
        id={breakLinkLabelId}
      />
    </>
  );

  return {
    autoFocusSelector: ".response",
    children: (
      <StandardPromptLayout
        className="p-edit-initiative"
        label={`Set initiative for ${combatant.DisplayName()} (${modifier}):`}
      >
        <Field
          name="initiativeRoll"
          className="response"
          type="number"
          defaultValue={preRoll}
          id={initiativeLabelId}
        />
        {breakLinkCheckbox}
      </StandardPromptLayout>
    ),
    initialValues: {
      initiativeRoll: preRoll,
      breakLink: false
    },
    onSubmit
  };
}
