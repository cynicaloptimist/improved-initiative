import { Field } from "formik";
import React = require("react");
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Dice } from "../../Rules/Dice";
import { PromptProps } from "./components/PendingPrompts";

interface RollDiceModel {
  diceExpression: string;
}

export const RollDicePrompt = (
  rollDiceExpression: (expression: string) => void
): PromptProps<RollDiceModel> => {
  const fieldLabelId = probablyUniqueString();
  return {
    onSubmit: (model: RollDiceModel) => {
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
      <div className="p-apply-damage">
        <label htmlFor={fieldLabelId}>{"Roll Dice: "}</label>
        <Field id={fieldLabelId} className="autofocus" name="diceExpression" />
        <SubmitButton />
      </div>
    )
  };
};
