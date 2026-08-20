import * as React from "react";

import { Field } from "formik";

import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

interface RestoreManaModel {
  restoreAmount: string;
}

export const RestoreManaPrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedRestore: string,
  logManaChange: (amount: number, combatantNames: string) => void
): PromptProps<RestoreManaModel> => {
  const combatantNames = combatantViewModels.map(c => c.Name()).join(", ");
  return {
    onSubmit: (model: RestoreManaModel) => {
      const restoreAmount = parseInt(model.restoreAmount);
      if (isNaN(restoreAmount)) {
        return false;
      }

      logManaChange(-restoreAmount, combatantNames);

      combatantViewModels.forEach(c =>
        c.ApplyManaChange("-" + model.restoreAmount)
      );
      return true;
    },

    initialValues: { restoreAmount: suggestedRestore },

    autoFocusSelector: ".autofocus",

    children: (
      <StandardPromptLayout label={`Restore mana for ${combatantNames}:`}>
        <Field type="number" className="autofocus" name="restoreAmount" />
      </StandardPromptLayout>
    )
  };
};
