import { Field } from "formik";
import React = require("react");
import { CombatantViewModel } from "../../../Combatant/CombatantViewModel";
import { SubmitButton } from "../../../Components/Button";
import { PromptProps } from "./PendingPrompts";

interface ApplyDamageModel {
  damageAmount: string;
}

export const ApplyDamagePrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedDamage: string
): PromptProps<ApplyDamageModel> => ({
  onSubmit: (model: ApplyDamageModel) => {
    const damageAmount = parseInt(model.damageAmount);
    if (isNaN(damageAmount)) {
      return false;
    }
    combatantViewModels.forEach(c => c.ApplyDamage(model.damageAmount));
    return true;
  },

  initialValues: { damageAmount: suggestedDamage },

  children: (
    <div className="p-apply-damage">
      Apply damage or healing to{" "}
      {combatantViewModels.map(c => c.Name()).join(", ")}:
      <Field name="damageAmount" />
      <SubmitButton />
    </div>
  )
});
