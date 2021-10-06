import { Field } from "formik";
import React = require("react");
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

interface ApplyDamageModel {
  damageAmount: string;
}

export const ApplyDamagePrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedDamage: string,
  logHpChange: (damage: number, combatantNames: string) => void
): PromptProps<ApplyDamageModel> => {
  const combatantNames = combatantViewModels.map(c => c.Name()).join(", ");
  return {
    onSubmit: (model: ApplyDamageModel) => {
      const damageAmount = parseInt(model.damageAmount);
      if (isNaN(damageAmount)) {
        return false;
      }

      logHpChange(damageAmount, combatantNames);

      combatantViewModels.forEach(c => c.ApplyDamage(model.damageAmount));
      return true;
    },

    initialValues: { damageAmount: suggestedDamage },

    autoFocusSelector: ".autofocus",

    children: (
      <StandardPromptLayout
        className="p-apply-damage"
        label={`Apply damage or healing to ${combatantNames}`}
      >
        <Field type="number" className="autofocus" name="damageAmount" />
      </StandardPromptLayout>
    )
  };
};
