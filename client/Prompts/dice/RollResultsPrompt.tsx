import * as React from "react";

import { DiceRoll } from "../../Rules/Dice";
import { PromptProps } from "../PendingPrompts";
import { RollResultComponent } from "./components/RollResults";

export const DiceRollResultPrompt = (
  initialResult: DiceRoll,
  handleRoll: (roll: DiceRoll) => void
): PromptProps<Record<string, never>> => {
  return {
    className: "prompt--dice-roll-result",
    onSubmit: () => false,
    initialValues: {},
    autoFocusSelector: ".prompt__close",
    children: (
      <RollResultComponent
        initialRoll={initialResult}
        handleReroll={handleRoll}
      />
    )
  };
};
