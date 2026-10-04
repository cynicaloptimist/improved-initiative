import Tippy from "@tippyjs/react";
import { Field, FieldProps } from "formik";
import * as React from "react";

import { probablyUniqueString } from "../../../common/Toolbox";
import { isValidDiceExpression } from "../../Rules/DiceExpression";
import { PromptProps } from "../PendingPrompts";
import { StandardPromptLayout } from "../StandardPromptLayout";

interface RollDiceModel {
  diceExpression: string;
}

const DEFAULT_EXPRESSION = "1d20";
const NOTATION_TIP = "Use dice notation such as 1d20, 2d6 + 3, or +5.";
const INVALID_EXPRESSION_MESSAGE = "Invalid expression";

const validateDiceExpression = (expression: string): string | undefined => {
  if (!expression || isValidDiceExpression(expression)) {
    return undefined;
  }

  return INVALID_EXPRESSION_MESSAGE;
};

export const RollDicePrompt = (
  rollDiceExpression: (expression: string) => void
): PromptProps<RollDiceModel> => {
  const fieldLabelId = probablyUniqueString();
  return {
    onSubmit: (model: RollDiceModel) => {
      rollDiceExpression(model.diceExpression || DEFAULT_EXPRESSION);
      return true;
    },
    initialValues: { diceExpression: "" },
    autoFocusSelector: ".autofocus",
    children: (
      <StandardPromptLayout className="p-roll-dice" label="Roll Dice:">
        <span className="p-roll-dice__notation-tip">{NOTATION_TIP}</span>
        <Field name="diceExpression" validate={validateDiceExpression}>
          {({ field, meta }: FieldProps<string>) => (
            <Tippy
              content={meta.error}
              theme="error-message"
              visible={meta.touched && Boolean(meta.error)}
            >
              <input
                {...field}
                id={fieldLabelId}
                className="autofocus"
                placeholder={DEFAULT_EXPRESSION}
              />
            </Tippy>
          )}
        </Field>
      </StandardPromptLayout>
    )
  };
};
