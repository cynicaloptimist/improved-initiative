import React = require("react");
import { SubmitButton } from "../../Components/Button";
import { GetTimerReadout } from "../../Widgets/GetTimerReadout";
import { PromptProps } from "./PendingPrompts";

export const CombatStatsPrompt = (
  elapsedRounds: number,
  elapsedSeconds: number,
  combatants: {
    displayName: string;
    elapsedRounds: number;
    elapsedSeconds: number;
  }[]
): PromptProps<{}> => {
  const totalPlayerTime = combatants
    .map(c => c.elapsedSeconds)
    .reduce((total, curr) => total + curr, 0);
  const dmElapsedSeconds = elapsedSeconds - totalPlayerTime;

  return {
    onSubmit: () => true,

    initialValues: {},

    autoFocusSelector: ".autofocus",

    children: (
      <div className="combat-stats">
        <div className="combat-stats__header">
          <h4>Post-Combat Breakdown</h4>
          <SubmitButton />
        </div>
        <ul className={"playercharacters"}>
          {combatants.map((c, index) => (
            <li key={index}>
              <span>
                <strong>{c.displayName}</strong>
                {" participated in "}
                <strong>{c.elapsedRounds}</strong>
                {" rounds, averaging "}
                <strong>
                  {GetTimerReadout(c.elapsedSeconds / c.elapsedRounds)}
                </strong>
                {" per round."}
              </span>
            </li>
          ))}
        </ul>
        <ul className={"nonplayercharacters"}>
          <li key={0}>
            <span>
              {"Combat lasted "}
              <strong>{elapsedRounds}</strong>
              {" rounds, taking "}
              <strong>{GetTimerReadout(elapsedSeconds)}</strong>
              {", for an average of "}
              <strong>{GetTimerReadout(elapsedSeconds / elapsedRounds)}</strong>
              {" per round."}
            </span>
          </li>
          <li key={1}>
            <span>
              {"The DM took, on average "}
              <strong>
                {GetTimerReadout(dmElapsedSeconds / elapsedRounds)}
              </strong>
              {" per round."}
            </span>
          </li>
        </ul>
      </div>
    )
  };
};
