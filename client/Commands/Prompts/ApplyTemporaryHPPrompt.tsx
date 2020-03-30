import * as React from "react";
import { PromptProps } from "./PendingPrompts";
import { Field } from "formik";
import { SubmitButton } from "../../Components/Button";
import { StandardPromptLayout } from "./StandardPromptLayout";

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
      <StandardPromptLayout
        className="p-apply-temporary-hp"
        label={`Grant temporary hit points to ${combatantNames}: `}
      >
        <Field name="hpAmount" className="response" type="number" />
      </StandardPromptLayout>
    )
  };
}
