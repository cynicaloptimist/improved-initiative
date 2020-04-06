import * as React from "react";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { TrackerViewModel } from "../TrackerViewModel";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";
import { SubmitButton } from "../Components/Button";

type AcceptDamageModel = {
  damageAmount: "none" | "half" | "full";
};

export function AcceptDamagePrompt(
  suggestedCombatants: CombatantViewModel[],
  damageAmount: number,
  suggester: string,
  tracker: TrackerViewModel
): PromptProps<AcceptDamageModel> {
  const combatantNames = suggestedCombatants.map(c => c.Name()).join(", ");
  const displayType = damageAmount < 0 ? "healing" : "damage";
  const displayNumber = damageAmount < 0 ? -damageAmount : damageAmount;
  const promptLabel = `Accept ${displayNumber} ${displayType} to ${combatantNames} from ${suggester}?`;

  return {
    autoFocusSelector: ".accept-full",
    children: (
      <StandardPromptLayout label={promptLabel} noSubmit>
        <SubmitButton text="Yes" bindModel={["damageAmount", "full"]} />
        <SubmitButton
          text="No"
          bindModel={["damageAmount", "none"]}
          fontAwesomeIcon="times"
        />
        <SubmitButton
          text="Half"
          bindModel={["damageAmount", "half"]}
          fontAwesomeIcon="adjust"
        />
      </StandardPromptLayout>
    ),
    initialValues: { damageAmount: "none" },
    onSubmit: model => {
      if (model.damageAmount == "full") {
        suggestedCombatants.forEach(c =>
          c.ApplyDamage(damageAmount.toString())
        );
        tracker.EventLog.LogHPChange(damageAmount, combatantNames);
      }
      if (model.damageAmount == "half") {
        const halfDamage = Math.floor(damageAmount / 2);
        suggestedCombatants.forEach(c => c.ApplyDamage(halfDamage.toString()));
        tracker.EventLog.LogHPChange(halfDamage, combatantNames);
      }

      return true;
    }
  };
}
