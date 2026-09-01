import { Field } from "formik";
import * as React from "react";

import { probablyUniqueString } from "../../common/Toolbox";
import { Button } from "../Components/Button";
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

const RollChip = ({ value, max }: { value: number; max: number }) => {
  const classNames = ["p-roll-dice-result__roll"];
  if (value === 1) {
    classNames.push("p-roll-dice-result__roll--min");
  }
  if (value === max) {
    classNames.push("p-roll-dice-result__roll--max");
  }

  return <span className={classNames.join(" ")}>{value}</span>;
};

const RollResultComponent = ({
  initialResult: initialResult,
  handleReroll
}: {
  initialResult: RollResult;
  handleReroll: () => RollResult;
}) => {
  const [rollResult, setRollResult] = React.useState(initialResult);
  const normalizedExpression = `${rollResult.Rolls.length}d${rollResult.DieSize}${rollResult.ModifierText}`;
  const calculation = `${rollResult.ModifierText} = ${rollResult.Total}`.trim();

  return (
    <div className="p-roll-dice-result">
      <div className="p-roll-dice-result__total">{rollResult.Total}</div>
      <div className="p-roll-dice-result__details">
        <span className="p-roll-dice-result__expression">
          Rolled {normalizedExpression}
        </span>
        <span className="p-roll-dice-result__rolls">
          {rollResult.Rolls.map((roll, index) => (
            <RollChip value={roll} max={rollResult.DieSize} key={index} />
          ))}
          <span className="p-roll-dice-result__calculation">{calculation}</span>
        </span>
      </div>
      <Button
        additionalClassNames="p-roll-dice-result__reroll"
        ariaLabel="Reroll"
        fontAwesomeIcon="sync"
        onClick={() => setRollResult(handleReroll())}
        tooltip="Reroll"
      />
    </div>
  );
};

export const ShowDiceRollResultPrompt = (
  initialResult: RollResult,
  handleReroll: () => RollResult
): PromptProps<Record<string, never>> => {
  return {
    className: "prompt--dice-roll-result",
    onSubmit: () => false,
    initialValues: {},
    autoFocusSelector: ".prompt__close",
    children: (
      <RollResultComponent
        initialResult={initialResult}
        handleReroll={handleReroll}
      />
    )
  };
};
