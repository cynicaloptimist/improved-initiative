import { Field } from "formik";
import React = require("react");
import { probablyUniqueString } from "../../../../common/Toolbox";
import { CombatantViewModel } from "../../../Combatant/CombatantViewModel";
import { SubmitButton } from "../../../Components/Button";
import { PromptProps } from "./PendingPrompts";

interface ApplyHealingModel {
  healingAmount: string;
}

export const ApplyHealingPrompt = (
  combatantViewModels: CombatantViewModel[],
  suggestedHealing: string,
  logHpChange: (healing: number, combatantNames: string) => void
): PromptProps<ApplyHealingModel> => {
  const fieldLabelId = probablyUniqueString();
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
      <div className="p-apply-damage">
        <label htmlFor={fieldLabelId}>
          {"Apply healing to "}
          {combatantViewModels.map(c => c.Name()).join(", ")}:
        </label>
        <Field
          id={fieldLabelId}
          type="number"
          className="autofocus"
          name="healingAmount"
        />
        <SubmitButton />
      </div>
    )
  };
};
