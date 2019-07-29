import { Field } from "formik";
import React = require("react");
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Formula } from "../../Rules/Formulas/Formula";
import { FormulaResult } from "../../Rules/Formulas/FormulaTerm";
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
      const isLegalExpression = Formula.Pattern.test(model.diceExpression);
      if (!isLegalExpression) {
        return false;
      }

      rollDiceExpression(model.diceExpression);
      return true;
    },

    initialValues: { diceExpression: "" },

    autoFocusSelector: ".autofocus",

    children: (
      <div className="prompt--with-submit-on-right">
        <div>
          <label htmlFor={fieldLabelId}>{"Roll Dice: "}</label>
          <Field
            id={fieldLabelId}
            className="autofocus"
            name="diceExpression"
          />
        </div>
        <SubmitButton />
      </div>
    )
  };
};

export const ShowDiceRollPrompt = (
  diceExpression: string,
  rollResult: FormulaResult
) => ({
  onSubmit: () => true,
  initialValues: {},
  autoFocusSelector: ".response",
  children: (
    <div className="prompt--with-submit-on-right">
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
