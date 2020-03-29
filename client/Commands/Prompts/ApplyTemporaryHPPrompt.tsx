import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Field } from "formik";
import { SubmitButton } from "../../Components/Button";

type ApplyTemporaryHPModel = { hpAmount: number };

export function ApplyTemporaryHPPrompt(
  combatantNames: string,
  applyHp: (model: ApplyTemporaryHPModel) => boolean
): PromptProps<ApplyTemporaryHPModel> {
  return {
    onSubmit: applyHp,
    initialValues: { hpAmount: 0 },
    autoFocusSelector: ".response",
    children: (
      <div className="p-apply-temporary-hp">
        <label className="message">Grant temporary hit points to {combatantNames}: </label>
        <Field name="hpAmount" className="response" type="number" />
        <SubmitButton />
      </div>
    )
  };
}
