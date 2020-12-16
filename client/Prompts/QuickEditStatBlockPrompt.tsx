import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { Metrics } from "../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import { Field } from "formik";
import { StandardPromptLayout } from "./StandardPromptLayout";
import { Combatant } from "../Combatant/Combatant";

type QuickAddModel = {
  Name: string;
  MaxHP: number;
  AC: number;
};

export function QuickEditStatBlockPrompt(
  combatant: Combatant,
  updateStatBlock: (updatedStatBlock: StatBlock) => void
): PromptProps<QuickAddModel> {
  const statBlock = combatant.StatBlock();

  return {
    autoFocusSelector: "input[name='Name']",
    children: (
      <StandardPromptLayout
        className="p-quick-add"
        label="Quick Edit Combatant"
      >
        Name <Field name="Name" type="text" />
        Max HP <Field name="MaxHP" type="number" />
        AC <Field name="AC" type="number" />
      </StandardPromptLayout>
    ),
    initialValues: {
      Name: statBlock.Name,
      MaxHP: statBlock.HP.Value,
      AC: statBlock.AC.Value
    },
    onSubmit: model => {
      const updatedStatBlock: StatBlock = {
        ...statBlock,
        Name: model.Name ?? statBlock.Name,
        HP: {
          Value: model.MaxHP ?? statBlock.HP.Value,
          Notes: statBlock.HP.Notes
        },
        AC: { Value: model.AC ?? statBlock.AC.Value, Notes: statBlock.AC.Notes }
      };

      updateStatBlock(updatedStatBlock);
      Metrics.TrackEvent("CombatantStatBlockQuickEdited", { Name: model.Name });
      return true;
    }
  };
}
