import { Field } from "formik";
import * as React from "react";

import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

interface ApplyManaModel {
  manaAmount: string;
}

export const ApplyManaPrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedMana: string,
  logManaChange: (amount: number, combatantNames: string) => void
): PromptProps<ApplyManaModel> => {
  const combatantNames = combatantViewModels.map(c => c.Name()).join(", ");
  return {
    onSubmit: (model: ApplyManaModel) => {
      const manaAmount = parseInt(model.manaAmount);
      if (isNaN(manaAmount)) {
        return false;
      }

      logManaChange(manaAmount, combatantNames);

      combatantViewModels.forEach(c => c.ApplyManaChange(model.manaAmount));
      return true;
    },

    initialValues: { manaAmount: suggestedMana },

    autoFocusSelector: ".autofocus",

    children: (
      <StandardPromptLayout
        className="p-apply-mana"
        label={`Spend or restore mana for ${combatantNames}`}
      >
        <Field type="number" className="autofocus" name="manaAmount" />
      </StandardPromptLayout>
    )
  };
};
