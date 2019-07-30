import { Field } from "formik";
import React = require("react");
import { StatBlock } from "../../../common/StatBlock";
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Formula } from "../../Rules/Formulas/Formula";
import { FormulaResult } from "../../Rules/Formulas/FormulaTerm";
import { PromptProps } from "./components/PendingPrompts";

interface RollDiceModel {
  diceExpression: string;
}

export const RollDicePrompt = (
  displayRollResult: (expression: string, result: FormulaResult) => boolean,
  selectedStatBlock: () => StatBlock
): PromptProps<RollDiceModel> => {
  const fieldLabelId = probablyUniqueString();
  let errors: any = {};
  return {
    onSubmit: (model: RollDiceModel) => {
      errors = {};
      if (!Formula.WholeStringMatch.test(model.diceExpression)) {
        errors.Forumla = "Formula syntax error";
        return false;
      }

      const statBlock = selectedStatBlock();
      const formula = new Formula(model.diceExpression);
      if (statBlock === null && formula.RequiresStats) {
        errors.Formula = "That formula requires a combatant to be selected";
        return false;
      }
      return displayRollResult(
        model.diceExpression,
        formula.RollCheck(statBlock)
      );
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
        {errors.Formula ? (
          <p className="c-statblock-editor__error">{errors.Formula}</p>
        ) : (
          ""
        )}
      </div>
    )
  };
};

export const ShowDiceRollPrompt = (
  originalExpression: string,
  rollResult: FormulaResult
) => ({
  onSubmit: () => true,
  initialValues: {},
  autoFocusSelector: ".response",
  children: (
    <div className="prompt--with-submit-on-right">
      <div>
        {"Rolled: "}
        {originalExpression}
        {" → "}
        <span
          dangerouslySetInnerHTML={{ __html: rollResult.FormattedString }}
        />
        <input
          className="response"
          type="text"
          readOnly
          disabled
          value={rollResult.Total}
        />
      </div>
      <SubmitButton />
    </div>
  )
});
