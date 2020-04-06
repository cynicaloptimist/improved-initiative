import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { Metrics } from "../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import { Field } from "formik";
import { StandardPromptLayout } from "./StandardPromptLayout";

type QuickAddModel = {
  Name: string;
  MaxHP: number;
  AC: number;
  Initiative: number;
};

export function QuickAddPrompt(
  addStatBlock: (statBlock: StatBlock) => void
): PromptProps<QuickAddModel> {
  return {
    autoFocusSelector: "input[name='Name']",
    children: (
      <StandardPromptLayout className="p-quick-add" label="Quick Add Combatant">
        <Field name="Name" type="text" placeholder="Name" />
        <Field name="MaxHP" type="number" placeholder="HP" />
        <Field name="AC" type="number" placeholder="AC" />
        <Field name="Initiative" type="number" placeholder="Init" />
      </StandardPromptLayout>
    ),
    initialValues: {
      Name: "",
      MaxHP: null,
      AC: null,
      Initiative: null
    },
    onSubmit: model => {
      if (model.MaxHP == null) {
        return false;
      }

      const statBlock: StatBlock = {
        ...StatBlock.Default(),
        Name: model.Name || "New Combatant",
        HP: { Value: model.MaxHP, Notes: "" },
        AC: { Value: model.AC ?? 10, Notes: "" },
        InitiativeModifier: model.Initiative ?? 0
      };

      addStatBlock(statBlock);
      Metrics.TrackEvent("CombatantQuickAdded", { Name: model.Name });
      return true;
    }
  };
}
