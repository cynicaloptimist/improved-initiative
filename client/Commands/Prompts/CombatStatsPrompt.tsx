import React = require("react");
import { SubmitButton } from "../../Components/Button";
import { PromptProps } from "./PendingPrompts";

export const CombatStatsPrompt = (
  totalElapsedRounds: number,
  elapsedSecondsReadout: string,
  averageSecondsReadout: string,
  combatants: {
    displayName: string;
    elapsedRounds: number;
    averageTimeReadout: string;
  }[]
): PromptProps<{}> => {
  return {
    onSubmit: () => true,

    initialValues: {},

    autoFocusSelector: ".autofocus",

    children: (
      <div className="prompt--with-submit-on-right">
        <h4>Post-Combat Breakdown</h4>
        <div>
          {"Combat lasted "}
          {totalElapsedRounds}
          {"rounds, taking "}
          {elapsedSecondsReadout}
          {", for an average of "}
          {averageSecondsReadout}
          {" per round."}
        </div>
        <div>
          {combatants
            .map(
              c =>
                `${c.displayName} participated in ${
                  c.elapsedRounds
                } rounds, averaging ${c.averageTimeReadout} per round.`
            )
            .join("\n")}
        </div>
        <SubmitButton />
      </div>
    )
  };
};
