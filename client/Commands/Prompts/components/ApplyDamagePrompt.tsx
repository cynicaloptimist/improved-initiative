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
  suggestedDamage: string,
  logHpChange: (damage: number, combatantNames: string) => void
): PromptProps<ApplyDamageModel> => ({
  onSubmit: (model: ApplyDamageModel) => {
    const damageAmount = parseInt(model.damageAmount);
    if (isNaN(damageAmount)) {
      return false;
    }

    const combatantNames = combatantViewModels.map(c => c.Name());
    logHpChange(damageAmount, combatantNames.join(", "));

    combatantViewModels.forEach(c => c.ApplyDamage(model.damageAmount));
    return true;
  },

  initialValues: { damageAmount: suggestedDamage },

  autoFocusSelector: ".autofocus",

  children: (
    <div className="p-apply-damage">
      {"Apply damage or healing to "}
      {combatantViewModels.map(c => c.Name()).join(", ")}:
      <Field className="autofocus" name="damageAmount" />
      <SubmitButton />
    </div>
  )
});
