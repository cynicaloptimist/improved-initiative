import { Field } from "formik";
import React = require("react");
import { probablyUniqueString } from "../../../../common/Toolbox";
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
): PromptProps<ApplyDamageModel> => {
  const fieldLabelId = probablyUniqueString();
  return {
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
        <label htmlFor={fieldLabelId}>
          {"Apply damage or healing to "}
          {combatantViewModels.map(c => c.Name()).join(", ")}:
        </label>
        <Field
          id={fieldLabelId}
          type="number"
          className="autofocus"
          name="damageAmount"
        />
        <SubmitButton />
      </div>
    )
  };
};
