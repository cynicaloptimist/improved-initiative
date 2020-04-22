import React = require("react");
import { Field } from "formik";

import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

interface ApplyHealingModel {
  healingAmount: string;
}

export const ApplyHealingPrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedHealing: string,
  logHpChange: (healing: number, combatantNames: string) => void
): PromptProps<ApplyHealingModel> => {
  const combatantNames = combatantViewModels.map(c => c.Name()).join(", ");
  return {
    onSubmit: (model: ApplyHealingModel) => {
      const healingAmount = parseInt(model.healingAmount);
      if (isNaN(healingAmount)) {
        return false;
      }

      const combatantNames = combatantViewModels.map(c => c.Name());
      logHpChange(-healingAmount, combatantNames.join(", "));

      combatantViewModels.forEach(c =>
        c.ApplyDamage("-" + model.healingAmount)
      );
      return true;
    },

    initialValues: { healingAmount: suggestedHealing },

    autoFocusSelector: ".autofocus",

    children: (
      <StandardPromptLayout label={`Apply healing to ${combatantNames}:`}>
        <Field type="number" className="autofocus" name="healingAmount" />
      </StandardPromptLayout>
    )
  };
};
