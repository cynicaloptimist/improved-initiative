import { Field } from "formik";
import React = require("react");
import { probablyUniqueString } from "../../common/Toolbox";
import { SubmitButton } from "../Components/Button";
import { Dice } from "../Rules/Dice";
import { RollResult } from "../Rules/RollResult";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

interface RollDiceModel {
  diceExpression: string;
}

export const RollDicePrompt = (
  rollDiceExpression: (expression: string) => void
): PromptProps<RollDiceModel> => {
  const fieldLabelId = probablyUniqueString();
  return {
    onSubmit: (model: RollDiceModel) => {
      if (!model.diceExpression) {
        rollDiceExpression("1d20");
        return true;
      }
      const isLegalExpression = Dice.ValidDicePattern.test(
        model.diceExpression
      );
      if (!isLegalExpression) {
        return false;
      }

      rollDiceExpression(model.diceExpression);
      return true;
    },

    initialValues: { diceExpression: "" },

    autoFocusSelector: ".autofocus",

    children: (
      <StandardPromptLayout className="p-roll-dice" label="Roll Dice:">
        <Field
          id={fieldLabelId}
          className="autofocus"
          name="diceExpression"
          placeholder="1d20"
        />
      </StandardPromptLayout>
    )
  };
};

export const ShowDiceRollPrompt = (
  diceExpression: string,
  rollResult: RollResult
) => ({
  onSubmit: () => true,
  initialValues: {},
  autoFocusSelector: ".response",
  children: (
    <div className="p-roll-dice">
      <div>
        {"Rolled: "}
        {diceExpression}
        {" -> "}
        <span
          dangerouslySetInnerHTML={{ __html: rollResult.FormattedString }}
        />
        <input className="response" type="number" value={rollResult.Total} />
      </div>
      <SubmitButton />
    </div>
  )
});
