import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Combatant } from "../../Combatant/Combatant";
import {
  toModifierString,
  probablyUniqueString
} from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Field } from "formik";

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
      <span className="p-edit-initiative">
        <label className="message" htmlFor={initiativeLabelId}>
          Set initiative for {combatant.DisplayName()} ({modifier}):
        </label>
        <Field
          name="initiativeRoll"
          className="response"
          type="number"
          defaultValue={preRoll}
          id={initiativeLabelId}
        />
        {breakLinkCheckbox}
        <SubmitButton />
      </span>
    ),
    initialValues: {
      initiativeRoll: preRoll,
      breakLink: false
    },
    onSubmit
  };
}
